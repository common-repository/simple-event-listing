import ReactDOM from 'react-dom';
import React, {Component} from 'react';
import {Icon} from 'react-fa';

require('./style.scss');

class Pagination extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		if ( this.props.totalEvents > 0) {
			let pages = Array.apply(null, {length: this.props.totalPages}).map((value, index) => index + 1);;
			return (
				<nav className="pagination">
					<ul>
						{pages.map((page) => (
							<li
								className={page === this.props.currentPage ? 'current' : null}
								onClick={() => this.props.onChangePage(page)}
								key={page}>{page}</li>
						))}
					</ul>
				</nav>
			);
		}

		return(
			<nav>
			</nav>
		);
	}
}

export default Pagination;