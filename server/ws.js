// Based on:
// http://github.com/alexanderte/websocket-server-node.js
// http://github.com/Guille/node.websocket.js

function nano(template, data) {
  return template.replace(/\{([\w\.]*)}/g, function (str, key) {
    var keys = key.split("."), value = data[keys.shift()];
    keys.forEach(function (key) { value = value[key] });
    return value;
  });
}

var sys = require("sys"),
  tcp = require("tcp"),
  headerExpressions = [
    /^GET (\/[^\s]*) HTTP\/1\.1$/,
    /^Upgrade: WebSocket$/,
    /^Connection: Upgrade$/,
    /^Host: (.+)$/,
    /^Origin: (.+)$/
  ],
  handshakeTemplate = [
    'HTTP/1.1 101 Web Socket Protocol Handshake',
    'Upgrade: WebSocket',
    'Connection: Upgrade',
    'WebSocket-Origin: {origin}',
    'WebSocket-Location: ws://{host}{resource}',
    '',
    ''
  ].join("\r\n"),
  policy_file = '<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>';

exports.createServer = function (websocketListener) {
  return tcp.createServer(function (socket) {
    socket.setTimeout(0);
    socket.setNoDelay(true);
    socket.setEncoding("utf8");

    var emitter = new process.EventEmitter(),
      handshaked = false;

    function handle(data) {
      // CHANGED
      // This seemed to have an issue with multiplexed data
      // The fix degrades performance, but it might be necessary
      // Necessary to be a valid message, but possible that it is
      // multiple valid messages
      if(data[0] == "\u0000" && data[data.length - 1] == "\ufffd") {
        var start = 1;
        for(var i = 1; i < data.length - 1; i++) {
          // If we see a beginning token preceded by an end token,
          // then we have a whole message
          if(data[i - 1] == "\ufffd" && data[i] == "\u0000") {
            emitter.emit("receive", data.substring(start, i - 2));
            start = i + 1;
          }
        }
        // change?
        emitter.emit("receive", data.substring(start, data.length - 1));
      } else {
        socket.close();
      }
    }

    function handshake(data) {
      var headers = data.split("\r\n");

      if(/<policy-file-request.*>/.exec(headers[0])) {
        socket.send(policy_file);
        socket.close();
        return;
      }

      var matches = [], match;
      for (var i = 0, l = headerExpressions.length; i < l; i++) {
        match = headerExpressions[i].exec(headers[i]);

        if (match) {
          if(match.length > 1) {
            matches.push(match[1]);
          }
        } else {
          socket.close();
        }
      }

      socket.send(nano(handshakeTemplate, {
        resource: matches[0],
        host:     matches[1],
        origin:   matches[2],
      }));

      handshaked = true;
      emitter.emit("connect", matches[0]);
    }

    socket.addListener("receive", function (data) {
      if(handshaked) {
        handle(data);
      } else {
        handshake(data);
      }
    }).addListener("eof", function () {
      socket.close();
    }).addListener("close", function () {
      if (handshaked) { // don't emit close from policy-requests
        emitter.emit("close");
      }
    });

    emitter.send = function (data) {
      socket.send('\u0000' + data + '\uffff');
    }

    emitter.close = function () {
      socket.close();
    }

    // CHANGED
    // makes it so that the closure passed to ws.createServer is called upon connect
    // (after the handshake)
    // this seems to be closer to the TCP interface, imho
    emitter.addListener("connect", function(ws) { websocketListener(emitter) }); // emits: "connect", "receive", "close", provides: send(data), close()
  });
}
