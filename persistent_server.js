var events = require('events');

// var nonlocal = function(lol) {
//   var ret = null
//   var valid = true
//   var leave = function (_) {
//     throw( valid ? ret = _: "you cant do that!!!")
//   }

//   try { return lol(leave) }
//   catch(err) { return ret }
//   finally { valid = false }
// }
module.exports = function ( ) {
  var mysql = require('mysql');  
  var db = mysql.createConnection({
    user: "face",
    password: "",
    database: "nodechat"
  });
  db.connect();

  function build (template) {
    return function build_in(table, o) {
      return template
      .replace('_t_', table)
      .replace('_k_', (table=Object.keys(o)).join(','))
      .replace('_v_', table.map(function (g) { return o[g]}).join(','))
    }
  }

  var ins = build("INSERT INTO _t_ (_k_) VALUES (_v_)")


  function obama(roomId, userId, data) {
    console.log(ins('messages', {text: data.text, userId: userId, room_id:roomId }))
    var query = 
    db.query("INSERT INTO messages (text,room_id,user_id) VALUES ("+db.escape(data.text)+','+roomId+','+userId+')', console.log.bind(console, 'success') )
  }

  function aquaman (data, userId) {
    console.log(data)
    db.query("SELECT COUNT(1) AS roomnum, id FROM rooms WHERE roomname = "+db.escape(data.roomname) , function(e,r,f ){
      if (r[0].roomnum !== 0) return obama(r[0].id, userId, data)
      console.log(ins('rooms', {roomName: data.roomName}))
      db.query("INSERT INTO rooms (roomname) VALUES ("+db.escape(data.roomname)+")", function (e,r, f){
        obama(r.insertId, userId, data)
      });
    });
  }

  var write_db = function (data) {
    console.log(data.roomname + 101)
    db.query("SELECT COUNT(1) AS num, id FROM users WHERE username = "+db.escape(data.username) , function(e,r,cb){
      if (r[0].num === 1) return aquaman(data, r[0].id)
      console.log(ins('users', {username: data.username}))
      db.query("INSERT INTO users (username) VALUES ("+db.escape(data.username)+")", function(e,r,cb){
        aquaman(data, r.insertId)
      })
    })
  }
  return {
    select: function (req, res) {
      db.query("SELECT * FROM messages LEFT JOIN rooms on messages.room_id = rooms.id LEFT JOIN users on messages.user_id=users.id", function (err, rows, field) {
      res.end(JSON.stringify(rows))
    })
    },
    insert: function (r) { write_db(r.body) },
    deletes: function (r) { db.query('delete from messages where id = '  + db.escape(r.url), function () { res.end('yay sucess')}) }
  }
}

function ee (cond, t, f) {
  return function (err, row, f) {
    cond(row) ? t(row) : f(row)
  }
}

var _ = function (stack) {
  var handle;
  stack.reverse().forEach(function (layer) {
    var child = handle;
    handle = function (result) {
      var next = function () { child && child(result) }
      layer(data, next);
    }      
  });
  return handle;
}

