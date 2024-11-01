<?php

/**
 * Simple widget for listing events
 */
class Simple_Event_Listing_Widget extends WP_Widget {

	function __construct() {
		$widget_ops = array(
			'description' => __( 'Customizable listing of simple-event-listing.php')
		);
		parent::__construct( 'react-demo', __('Simple Event Listing'), $widget_ops);
	}

	function widget( $args, $instance ) {
		echo $args['before_widget'];
		?>
			<div class="simple-event-listing-widget">
				<?php
				$shortcode = '[simple_event_listing]';
				foreach (['title','type','start_date','end_date','order','count'] as $field) {
					$shortcode = str_replace( ']', ' '.$field.'="'.$instance[$field].'"]', $shortcode);
				}
				echo do_shortcode( $shortcode );
				?>
			</div>
		<?php
		echo $args['after_widget'];
	}

	function update( $new_instance, $old_instance ) {
		$instance = $old_instance;

		$instance['title'] = sanitize_text_field( $new_instance['title'] );
		$instance['type'] = sanitize_text_field( $new_instance['type'] );
		$instance['start_date'] = sanitize_text_field( $new_instance['start_date'] );
		$instance['end_date'] = sanitize_text_field( $new_instance['end_date'] );
		$instance['order'] = sanitize_text_field( $new_instance['order'] );
		$instance['count'] = sanitize_text_field( $new_instance['count'] );
		
		wp_cache_delete( $this->widget_slug, 'widget' );
		return $instance;
	}

	function form( $instance ) {
		$instance = wp_parse_args( (array) $instance,
			array(
				'title' => 'Upcoming Events',
				'type'  => 'upcoming',
				'count' => 10,
				'order' => 'ASC',
			)
		);

		$types = array(
			'upcoming' => 'Upcoming Events',
			'past' => 'Past Events',
			'range' => 'Date Range',
		);
		$orders = array(
			'ASC' => 'Oldest first',
			'DESC' => 'Newest first',
		);
		?>
		<div>
			<label>
				Title
			</label>
			<input name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo $instance['title']; ?>" />
		</div>

		<div>
			<label>
				Type
			</label>
			<select name="<?php echo esc_attr( $this->get_field_name( 'type' ) ); ?>">
				<?php foreach ($types as $value => $label): ?>
					<option value="<?php echo $value; ?>" <?php selected( $instance['type'], $value, true ); ?>>
						<?php echo $label; ?>
					</option>
				<?php endforeach ?>
			</select>
		</div>

		<div>
			<label>
				Start Date
			</label>
			<input name="<?php echo esc_attr( $this->get_field_name( 'start_date' ) ); ?>" type="date" value="<?php echo $instance['start_date']; ?>" />
		</div>

		<div>
			<label>
				End Date
			</label>
			<input name="<?php echo esc_attr( $this->get_field_name( 'end_date' ) ); ?>" type="date" value="<?php echo $instance['end_date']; ?>" />
		</div>

		<div>
			<label>
				Sort Order
			</label>
			<select name="<?php echo esc_attr( $this->get_field_name( 'order' ) ); ?>">
				<?php foreach ($orders as $value => $label): ?>
					<option value="<?php echo $value; ?>" <?php selected( $instance['order'], $value, true ); ?>>
						<?php echo $label; ?>
					</option>
				<?php endforeach ?>
			</select>
		</div>

		<div>
			<label>
				Number of Events
			</label>
			<input name="<?php echo esc_attr( $this->get_field_name( 'count' ) ); ?>" type="number" value="<?php echo $instance['count']; ?>" />
		</div>
		<?php
	}

}
