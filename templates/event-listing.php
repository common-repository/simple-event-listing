<?php if ( $events->have_posts() ) : ?>
	<ul class="simple-event-listing">
		<?php while( $events->have_posts() ): $events->the_post(); ?>
			<li>
				<h3 class="simple-event-title">
					<a href="<?php echo get_post_meta( get_the_id(), '_link', true ); ?>">
						<?php the_title(); ?>
					</a>
				</h3>
				<div class="simple-event-meta">
					<div class="simple-event-start_date">
						<?php
							$date = get_post_meta( get_the_id(), '_start_date', true );
							$date = new DateTime( $date );
						?>
						<strong>When:</strong> <?php echo $date->format('F j, Y'); ?>
					</div>
					<div class="simple-event-locale">
						<strong>Locale:</strong> <?php echo get_post_meta( get_the_id(), '_locale', true ); ?></div>
				</div>
				<div class="simple-event-description">
					<?php the_content(); ?>
				</div>
			</li>
		<?php endwhile; ?>
	</ul>
<?php
	else : ?>
		<p class="simple-events-empty"><?php _e( 'No events found', 'simple-events'); ?></p>
	<?php endif; ?>

