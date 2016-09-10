
var Note = React.createClass({
  getInitialState: function() {
      return {editing: false}
  },

  componentWillMount: function() {
    this.style = {
      right: this.randomBetween(100, window.innerWidth - 400) + 'px',
      top: this.randomBetween(100, window.innerHeight - 400) + 'px',
      transform: "rotate(" + this.randomBetween(-10,10) + 'deg)'
    };
  },

  componentDidMount: function() {
    $(ReactDOM.findDOMNode(this)).draggable({ containment: "parent" });
  },

  edit: function() {
    this.setState({editing: true});
  },

  save: function() {
    this.props.onChange(ReactDOM.findDOMNode(this.refs.newText).value, this.props.index)
    this.setState({editing: false});
  },
  remove: function() {
    this.props.onRemove(this.props.index);
  },
  randomBetween: function(a,b) {
    return (a + Math.ceil(Math.random() * b));
  },
  renderDisplay: function() {
    return (
      <div className="note" style={this.style}>
        <p>{this.props.children}</p>
        <span>
          <button onClick={this.edit} className="btn btn-xs glyphicon glyphicon-pencil"/>
          <button onClick={this.remove} className="btn btn-xs glyphicon glyphicon-trash"/>
        </span>
      </div>
    );
  },
  renderForm: function() {
    return (
      <div className="note" style={this.style}>
        <textarea ref="newText" defaultValue={this.props.children} className="form-control"></textarea>
        <button onClick={this.save} className="btn btn-xs glyphicon glyphicon-ok" />
      </div>
    );
  },
  render: function() {
   return this.state.editing ? this.renderForm() : this.renderDisplay();
  }
});

var Board = React.createClass({
  getInitialState: function() {
    return {
      notes: [{id: 0, note: "i can't do line breaks at this point in time...working on it 😬 🤓 🙈"}]
    };
  },

  nextId: function() {
      this.uniqueId = this.uniqueId || 1;
      return this.uniqueId++;
  },

  update: function(newText, i) {
    var arr = this.state.notes;
    arr[i].note = newText;
    this.setState({notes: arr});
  },

  remove: function(i) {
    var arr = this.state.notes;
    arr.splice(i, 1);
    this.setState({notes: arr});
  },

  add: function(text) {
    var arr = this.state.notes;
    arr.push({
      id: this.nextId(),
      note: text
    });
    this.setState({notes: arr});
  },

  eachNote: function(note, i) {
    return (
      <Note key={note.id}
            index={i}
            onChange={this.update}
            onRemove={this.remove}>
        {note.note}
      </Note>
    );
  },

  render: function() {
    return (
      <div className="board">
        {this.state.notes.map(this.eachNote)}
        <button className="btn btn-lg glyphicon glyphicon-plus"
                onClick={this.add.bind(null, "")}/>
      </div>
    );
  }

});


ReactDOM.render(<Board />, document.getElementById("react-container"))



