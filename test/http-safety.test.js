'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {Readable} = require('node:stream');
const {validateRequest, readBoundedText, fetchText} = require('../lib/http-safety');
const request = (headers={},method='POST') => ({method,headers:{host:'127.0.0.1:5192','content-type':'application/json',...headers},socket:{}});
const local={host:'127.0.0.1'};
test('rejects cross-origin posts, simple-content-type posts and DNS rebinding hosts',()=>{
 assert.doesNotThrow(()=>validateRequest(request({origin:'http://127.0.0.1:5192'}),local));
 for(const headers of [{origin:'https://attacker.example'},{origin:'null'},{'sec-fetch-site':'cross-site'},{'content-type':'text/plain'},{host:'attacker.example'}]) assert.throws(()=>validateRequest(request(headers),local));
 assert.throws(()=>validateRequest(request({host:'attacker.example'},'GET'),local));
 assert.doesNotThrow(()=>validateRequest(request({host:'deck.example',origin:'https://deck.example'}),{host:'0.0.0.0',publicOrigin:'https://deck.example'}));
});
test('body limits count bytes and preserve split UTF-8 characters',async()=>{
 const bytes=Buffer.from('Kimliğin');
 assert.equal(await readBoundedText(Readable.from([bytes.subarray(0,6),bytes.subarray(6)]),20),'Kimliğin');
 await assert.rejects(readBoundedText(Readable.from([Buffer.alloc(4),Buffer.alloc(5)]),8),error=>error.status===413);
});
test('upstream timeout covers a body that stalls after headers',async()=>{
 await assert.rejects(fetchText('https://example.test',{}, {timeoutMs:20,fetchImpl:async(url,options)=>({ok:true,status:200,body:new ReadableStream({start(controller){options.signal.addEventListener('abort',()=>controller.error(new DOMException('Timeout','AbortError')));}})})}),{name:'AbortError'});
});
