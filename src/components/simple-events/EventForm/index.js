import React, {PropTypes, Component} from 'react';
import { Icon } from 'react-fa';
import moment from 'moment';
import DatePicker from 'react-datepicker';

require('react-datepicker/dist/react-datepicker.css');
require('./style.scss');

class EventForm extends Component {
  constructor(props) {
    super(props);

    let simpleEvent = props.simpleEvent;

		this.state = {
			missingTitle: false,
			missingStartDate: false,
			title: null,
			content: null,
			locale: null,
			link: null,
			start_date: null
		}

    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
  }

  handleDateChange(date) {
  	this.setState({
  		start_date: moment(date).format()
  	});
  }

  handleSubmit(event) {
    event.preventDefault();

		let { onSubmit } = this.props;
		let title = this.valueOf('title');
		let content = this.valueOf('content');
		let locale = this.valueOf('locale');
		let link = this.valueOf('link');
		let start_date = this.valueOf('start_date');

		this.setState({
			missingTitle: !title,
			missingStartDate: !start_date,
		});

    if (!title || !start_date) {
      return;
    }

    onSubmit({
			title,
			content,
			locale,
			link,
			start_date
    }).then(result => {
      this.setState({
				title: null,
				content: null,
				locale: null,
				link: null,
				start_date: null
      });
    });
  }

  valueOf(prop) {
    if (this.state[prop] !== null) {
      return this.state[prop];
    }

    if (this.props.simpleEvent && this.props.simpleEvent[prop]) {
      return this.props.simpleEvent[prop].raw ?
        this.props.simpleEvent[prop].raw :
        this.props.simpleEvent[prop];
    }

    return '';
  }

	render() {
		let start_date = this.valueOf('start_date');
		let start_date_obj = start_date ? moment(start_date) : null;

		let values = {
			title: this.valueOf('title'),
			content: this.valueOf('content'),
			locale: this.valueOf('locale'),
			link: this.valueOf('link'),
			start_date: start_date_obj
		};

		return(
			<form onSubmit={this.handleSubmit} className="event-form">
				<h2>{this.props.simpleEvent && this.props.simpleEvent.id ? 'Edit' : 'Create'} Event</h2>
				<div className="form-field">
					<label htmlFor="title">Event Title</label>
					{this.state.missingTitle ? (
						<p class="error">Title is required</p>
					) : null}
					<input
						type="text"
						name="title"
						id="title"
						placeholder="Event Title"
						defaultValue={null}
						value={values.title}
						onChange={this.handleChange}
						required />
				</div>
				<div className="form-field">
					<label htmlFor="locale">Location</label>
					<input
						type="text"
						name="locale"
						id="locale"
						placeholder="Event Location"
						defaultValue={null}
						value={values.locale}
						onChange={this.handleChange}/>
				</div>
				<div className="form-field">
					<label htmlFor="link">Link</label>
					<input
						type="text"
						name="link"
						id="link"
						placeholder="http://"
						defaultValue={null}
						value={values.link}
						onChange={this.handleChange}/>
				</div>
				<div className="form-field">
					{this.state.missingStartDate ? (
						<p class="error">Start Date is required</p>
					) : null}
					<label htmlFor="start_date">Start Date</label>
					<DatePicker
						id="start_date"
						dateFormat="MMM DD, YYYY"
						todayButton={'Today'}
						selected={values.start_date}
						showYearDropdown
						showMonthDropdown
						defaultValue={null}
						onChange={this.handleDateChange} />
				</div>
				<div className="form-field">
					<label htmlFor="content">Description</label>
					<textarea
						name="content"
						id="content"
						placeholder="Event description..."
						defaultValue={null}
						value={values.content}
						onChange={this.handleChange}></textarea>
				</div>
				<div className="form-field buttons">
					<button
						className="btn gray"
						type="button"
						title="Cancel"
						onClick={()=>this.props.onCancel(null)}><Icon name="ban"/> Cancel</button>
					<button
						className="btn"
						title="Save"
						type="submit"><Icon name="floppy-o"/> Save</button>
				</div>
			</form>
		);
	}
}

EventForm.propTypes = {
  simpleEvent: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.shape({
      raw: PropTypes.string,
      rendered: PropTypes.string,
    }),
    content: PropTypes.shape({
      raw: PropTypes.string,
      rendered: PropTypes.string,
    }),
    date: PropTypes.string,
    locale: PropTypes.string,
    link: PropTypes.string,
    start_date: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
};


export default EventForm;