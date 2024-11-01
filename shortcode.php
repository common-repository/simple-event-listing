<?php

function simple_event_listing_shortcode( $atts ) {
	$a = shortcode_atts( array(
		'type' => 'upcoming',
		'order' => 'ASC',
		'start_date' => null,
		'end_date' => null,
		'count' => -1
	), $atts );

	$today = date( 'Ymd' );
	$meta_query;

	switch ( $a[ 'type' ] ) {
		case 'past':
			$meta_query = array(
				array(
					'key' => '_start_date',
					'compare' => '<',
					'value'	=> $today
				)
			);
			break;
		case 'range':
			$meta_query = array(
				array(
					'key' => '_start_date',
					'compare'	=> 'BETWEEN',
					'value'	=> array($a['start_date'], $a['end_date']),
				),
			);
			break;
		default: // default is upcoming
			$meta_query = array(
				array(
					'key' => '_start_date',
					'compare' => '>=',
					'value' => $today
				),
			);
	}


	$args = array(
		'meta_key'	=> '_start_date',
		'order'	=> $a['order'],
		'orderby'	=> 'meta_value_num',
		'post_type'	=> 'simple_event',
		'posts_per_page'	=> $a['count'],
		'meta_query'	=> $meta_query,
	);

	$events = new WP_Query( $args );

	ob_start();

	if ( locate_template( 'event-listing.php' ) ) {
		include( locate_template( 'event-listing.php' ) );
	} else {
		include plugin_dir_path( __FILE__ ) . '/templates/event-listing.php';
	}

	return ob_get_clean();
	wp_reset_postdata();
}

add_shortcode( 'simple_event_listing', 'simple_event_listing_shortcode' );