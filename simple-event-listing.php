<?php
/**
 * Plugin Name: Simple Event Listing
 * Description: Easily create events and list them with widgets, shortcodes, or custom templates
 * Author: Natalie MacLees
 * Plugin URI:  https://simplyscheduleappointments.com
 * Version:     1.0.6
 * License:     GPLv2
 * Text Domain: simpleeventlisting
 *
 * @package Simply_Schedule_Appointments
 * @version 1.0.5
 */

include dirname( __FILE__ ) . '/widget.php';
include dirname( __FILE__ ) . '/shortcode.php';

class Simple_Event_Listing {

	static function widgets_init() {
		register_widget( 'Simple_Event_Listing_Widget' );
	}

	static function add_admin_page() {
		$my_page = add_menu_page(
			'Simple Event Listing',
			'Events',
			'manage_options',
			'simple-event-listing',
			array( 'Simple_Event_Listing', 'render_event_admin' ),
			'dashicons-editor-ul',
			21
		);

		add_action( 'load-' . $my_page, array( 'Simple_Event_Listing', 'load_admin_js') );
	}

	static function load_admin_js() {
		add_action( 'admin_enqueue_scripts', array( 'Simple_Event_Listing', 'admin_enqueue_scripts') );
	}

	static function admin_enqueue_scripts() {
		wp_register_script( 'simple-event-listing-admin', plugins_url( 'build/admin.js', __FILE__ ), array(), time(), true );
		wp_enqueue_style( 'simple-event-listing-admin', plugins_url( 'build/admin.css', __FILE__ ), array(), time());

		wp_localize_script(
			'simple-event-listing-admin',
			'WP_API_Settings',
			array(
				'root' => esc_url_raw( rest_url() ),
				'nonce'	=> wp_create_nonce( 'wp_rest' )
			)
		);

		wp_enqueue_script( 'simple-event-listing-admin' );
	}

	static function render_event_admin() {
		echo '<div id="simple_event_listing" class="wrap"></div>';
	}

	static function register_event_post_type() {
		$args = array(
			'labels' => array(
				'name' => _x( 'Events', 'post type general name', 'simpleeventlisting' ),
				'singular_name' => _x( 'Event', 'post type singular name', 'simpleeventlisting' ),
			),
			'description' => __( 'Events to be listed', 'simpleeventlisting' ),
			'hierarchical' => false,
			'menu_position' => null,
			'public' => true,
			'show_in_rest' => true,
			'rest_base' => 'simpleEvents',
			'capability_type' => 'post',
			'supports' => array( 'title', 'editor', 'custom-fields' )
		);

		register_post_type( 'simple_event', $args );
	}

  static function rest_query_vars( $vars ) {
		$vars[] = 'meta_query';
		return $vars;
  }

	static function register_rest_fields() {
		// Event Location field
		register_rest_field(
			'simple_event',
			'locale',
			array(
				'get_callback' => function ( $data ) {
					return get_post_meta( $data['id'], '_locale', true );
				},
				'update_callback' => function ( $value, $post ) {
					$value = sanitize_text_field( $value );
					update_post_meta( $post->ID, '_locale', wp_slash( $value ) );
				},
				'schema' => array(
					'description' => __( 'The location of the event.', 'simpleeventlisting' ),
					'type' => 'string'
				),
			)
		);
		// Event Link field
		register_rest_field(
			'simple_event',
			'link',
			array(
				'get_callback' => function ( $data ) {
					return get_post_meta( $data['id'], '_link', true );
				},
				'update_callback' => function ( $value, $post ) {
					$value = sanitize_text_field( $value );
					update_post_meta( $post->ID, '_link', wp_slash( $value ) );
				},
				'schema' => array(
					'description' => __( 'The link to buy ticket or learn more about the event', 'simpleeventlisting' ),
					'type' => 'string'
				),
			)
		);
		// Event Start Date field
		register_rest_field(
			'simple_event',
			'start_date',
			array(
				'get_callback' => function ( $data ) {
					return get_post_meta( $data['id'], '_start_date', true );
				},
				'update_callback' => function ( $value, $post ) {
					$value = sanitize_text_field( $value );
					$value = new DateTime( $value );
					update_post_meta( $post->ID, '_start_date', wp_slash( $value->format( 'Ymd' ) ) );
				},
				'schema' => array(
					'description' => __( 'The starting date of the event', 'simpleeventlisting' )
				),
			)
		);
	}

	static function get_upcoming_posts( $data ) {
		$today = date('Ymd');

		$args = array(
			'post_type' => 'simple_event',
			'meta_query'	=> array(
				array(
					'key'	=> '_start_date',
					'compare'	=> '>=',
					'value'	=> $today
				),
			),
			'orderby'	=> 'meta_value',
			'meta_key'	=> '_start_date',
			'order'	=> 'ASC',
		);

		$events = new WP_Query( $args );

		// return json_encode($events->get_posts());

		return $events->get_posts();
	}

	static function get_past_posts( $data ) {
		$today = date('Ymd');

		$args = array(
			'post_type' => 'simple_event',
			'meta_query'	=> array(
				array(
					'key'	=> '_start_date',
					'compare'	=> '<',
					'value'	=> $today
				),
			),
			'orderby'	=> 'meta_value',
			'meta_key'	=> '_start_date',
			'order'	=> 'DESC',
		);

		$events = new WP_Query( $args );

		// return json_encode($events->get_posts());

		return $events->get_posts();
	}

	static function pre_get_posts( $query ) {
		if ( empty( $query->query_vars['post_type'] ) || $query->query_vars['post_type'] !== 'simple_event' ) {
			return $query;
		}

		if ( empty( $query->query_vars['orderby'] ) || $query->query_vars['orderby'] !== 'relevance' ) {
			return $query;
		}

		$query_type = $query->query_vars[ 's' ];
		unset( $query->query_vars['s'] );
		unset( $query->query_vars['orderby']);
		$meta_query;
		$today = date( 'Ymd' );
		$query->set( 'orderby', 'meta_value_num' );
		$query->set( 'meta_key', '_start_date' );

		switch ( $query_type ) {
			case 'upcoming':
				$meta_query = array(
					array(
						'key'	=> '_start_date',
						'compare' => '>=',
						'value' => $today,
					),
				);
				$query->set( 'meta_query', $meta_query);
				$query->set( 'order', 'ASC' );
				break;
			case 'past':
				$meta_query = array(
					array(
						'key' => '_start_date',
						'compare'	=> '<',
						'value' => $today,
					),
				);
				$query->set( 'order', 'DESC' );
				$query->set( 'meta_query', $meta_query );
				break;
			default:
				$query->set( 'order', 'DESC' );
		}

		return $query;
	}
}

add_action( 'widgets_init', array( 'Simple_Event_Listing', 'widgets_init' ) );
add_action( 'init', array( 'Simple_Event_Listing', 'register_event_post_type' ) );
add_action ('rest_api_init', array( 'Simple_Event_Listing', 'register_rest_fields' ) );
add_action( 'admin_menu', array( 'Simple_Event_Listing', 'add_admin_page' ) );

add_filter( 'rest_query_vars', array( 'Simple_Event_Listing', 'rest_query_vars' ) );

add_action( 'pre_get_posts', array( 'Simple_Event_Listing', 'pre_get_posts' ) );

add_action( 'rest_api_init', function () {
  register_rest_route( 'sel/v2', '/upcoming-events', array(
    'methods' => 'GET',
    'callback' => array( 'Simple_Event_Listing', 'get_upcoming_posts' )
  ) );
  register_rest_route( 'sel/v2', '/past-events', array(
    'methods' => 'GET',
    'callback' => array( 'Simple_Event_Listing', 'get_past_posts' )
  ) );
} );
