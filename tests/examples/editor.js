var Editor = require('editor');
var _ = require('underscore');
var Backbone = require('backbone');

window.reqs = _.extend([
  { x: 0, y: 0, name: 'ID 1', cid:1},
  { x: 1, y: 0, name: 'ID 2', cid:2},
  { x: 2, y: 1, name: 'ID 3', cid:3}
], Backbone.Events);
var nextId = 4;
window.reqs.add = function (item) {
  this.push(item);
  this.trigger('add', item);
};
window.reqs.remove = function (id) {
  var item = _.findWhere(reqs, {cid: id}); 
  if (item) {
    this.splice(reqs.indexOf(item), 1);
    this.trigger('remove', item);
  }
};

var editor = new Editor({
  columns: 3,
  canvas: document.getElementById('canvas'),
  mode: 'edit',
  requirements: reqs
});

editor.render();

editor.on('all', function (evt, obj) {
  console.log('Event on editor, type: "%s" object:', evt, obj);
});
window.reqs.on('all', function (evt, obj) {
  console.log('Event on collection, type: "%s" object:', evt, obj);
});

editor.on('delete', function (obj) {
  window.reqs.remove(obj.cid);
});

$(window).bind('resize', function () {
  if ($('[name="resize"]:checked').val() === 'redraw') {
    $('#canvas').attr('width', $('#canvas-container').width());
    editor.refresh();
  }
});

$('[name="resize"]').change(function () {
  $('#canvas').attr('width', $('#canvas-container').width());
  editor.refresh();
});

$('#num-columns').keyup(function () {
  var n = parseInt($(this).val());
  if (n) {
    editor.columnCount = n;
    editor.refresh();
  }
});

$('#add').click(function () {
  var id = nextId++;
  var x = $('#add-x').val();
  var y = $('#add-y').val();
  reqs.add({
    cid: id,
    name: 'ID ' + id,
    x: x,
    y: y
  });
});

$('#remove').click(function () {
  var id = parseInt($('#remove-id').val());
  console.log('removing', id);
  if (id) reqs.remove(id);
});

$('#enableEdit').change(function () {
  var flag = $(this).is(':checked');
  editor.mode = flag ? 'edit' : 'whateverelse';
});
$('#enableDelete').change(function () {
  var flag = $(this).is(':checked');
  editor.enableDelete(flag);
  editor.refresh();
});
