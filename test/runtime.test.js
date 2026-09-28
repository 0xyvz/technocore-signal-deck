'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicOrigin}=require('../lib/runtime');
const {validateRequest}=require('../lib/http-safety');
test('Codespaces forwarded HTTPS origin is accepted without trusting arbitrary hosts',()=>{
 const env={CODESPACES:'true',CODESPACE_NAME:'deck-test-123',GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:'app.github.dev'};
 const origin=publicOrigin(env,5192);
 assert.equal(origin,'https://deck-test-123-5192.app.github.dev');
 const request={method:'POST',headers:{host:'localhost:5192',origin,'content-type':'application/json'},socket:{}};
 assert.doesNotThrow(()=>validateRequest(request,{host:'0.0.0.0',publicOrigin:origin}));
 assert.throws(()=>validateRequest({...request,headers:{...request.headers,origin:'https://another-5192.app.github.dev'}},{host:'0.0.0.0',publicOrigin:origin}));
 assert.equal(publicOrigin({...env,PUBLIC_ORIGIN:'https://deck.example/'},5192),'https://deck.example');
 assert.equal(publicOrigin({},5192),'');
});
