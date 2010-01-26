/*===============================================
  File:      StringStream.js
  
  Author:    Isaac Schlueter
             Micheil Smith
  Description:
    A varient of Stream, which uses strings 
    instead of arrays.
===============================================*/

module.exports = Stream;

var Emitter = require("events").EventEmitter;

function Stream(delim) {
  Emitter.call(this);
  
  var buffer = [];
  buffer.delim = delim || 1024;
  
  this.pause = function () {
    buffer.paused = true;
  };
  this.resume = function () {
    buffer.paused = false;
    flow(this, buffer);
  };
  this.write = function (data) {
    if (buffer.closed) throw new Error("Cannot write after EOF.");
      
    if (data === null){
      buffer.closed = true;
    } else {
      buffer += data;
    }
    
    flow(this, buffer);
  };
  this.close = function () {
    if (buffer.closed) return;
    return this.write(null);
  };
};

function flow (emitter, buffer) {
  if (buffer.flowing || buffer.paused) return;
  
  buffer.flowing = true;
  
  if (buffer.length === 0){
    if(buffer.closed){
      emitter.emit("eof");
    } else {
      buffer.flowing = false;
      emitter.emit("drain");
    }
    return;
  }
  
  var idx = 0;
  
  if(typeof buffer.delim == String){
    idx = buffer.indexOf(buffer.delim);
  } else {
    idx = parseInt(delim, 10);
  }
  if(idx > 0){
    var chunk = buffer.substr(0, idx);
    buffer = buffer.substr(idx);
    
    emitter.emit("data", chunk, (typeof(chunk) === "string" ? chunk.length : undefined));
  }
  
  process.nextTick(function () {
    buffer.flowing = false;
    flow(emitter, buffer);
  });
};

Stream.prototype.__proto__ = Emitter.prototype;
