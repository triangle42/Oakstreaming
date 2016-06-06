var theVideoFileSize = 788493;


describe("Testing if manuallyAddingPeer methods", function(){
   var myStreaming = new OakStreaming();
   var myStreaming2 = new OakStreaming();
   var receivedCallbacks = 0;
   var peersAreConnected = false;
   var theTorrent;
   
   it("can establish a WebTorrent connection between two OakStreaming instances", function(done){
      expect(true).toBe(true); // every Jasmine it has to have an expect expression
            
      myStreaming.forTesting_connectedToNewWebTorrentPeer(function(){
         if(receivedCallbacks === 1){
            peersAreConnected = true;
            done();
         } else {
            receivedCallbacks++;
         }
      });
      myStreaming2.forTesting_connectedToNewWebTorrentPeer(function(){
         if(receivedCallbacks === 1){
            peersAreConnected = true;            
            done();
         } else {
            receivedCallbacks++;
         }
      });      
      myStreaming.createSignalingData(function(signalingData){
         myStreaming2.createSignalingDataResponse(signalingData, function(signalingDataResponse){
            myStreaming.processSignalingResponse(signalingDataResponse);
         });
      });
   });
   
   it("can successfully connect OakStreaming instances for streaming", function(done){
      expect(true).toBe(true); // every Jasmine it has to have an expect expression   
      
      function callback(streamInformationObject){
         myStreaming2.loadVideo(streamInformationObject, done, true);
      }
      
      function streamWhenConnectionEstablished(){
         if(peersAreConnected){
            testTorrent = myStreaming.streamVideo(res, {XHRPath : "/example.mp4"}, callback, 6257923579344);
         } else {
            setTimeout(streamWhenConnectionEstablished, 500);
         }
      }
      
      http.get({
         hostname: 'localhost',
         port: 8080,
         path: '/example.mp4',
         headers: {
            range: 'bytes=' + 0 + '-' + theVideoFileSize-1
         }
      }, function (res){
            streamWhenConnectionEstablished();
      });
   }, 30000);
   
   it("can establish a WebTorrent connection between two OakStreaming instances", function(done){
      
      
   },10000);
}   

function createSignalingData(callback){
   var myPeer = new SimplePeer({initiator: true, tickle: false});
   myPeer.on('signal', function (signalingData){
      signalingData.oakNumber = ++simplePeerCreationCounter;
      connectionsWaitingForSignalingData[simplePeerCreationCounter] = myPeer;
      callback(signalingData);
   });
}

function createSignalingDataResponse(signalingData, callback){
   var oakNumber;
   var myPeer = new SimplePeer({initiator: false, tickle: false});
   myPeer.on('signal', function (answerSignalingData){
      answerSignalingData.oaknumber = oakNumber;
      callback(answerSignalingData);
   });
   oakNumber = answerSignalingData.oakNumber;
   delete answerSignalingData.oakNumber;    
   myPeer.signal(signalingData);
   myPeer.on('connect', function(){
      addSimplePeerInstance(myPeer);
   });
}

function processSignalingResponse(signalingData){
   var oakNumber = signalingData.oakNumber;
   delete signalingData.oakNumber;
   myPeer.on('connect', function (){
      console.log('CONNECT');
      addSimplePeerInstance(myPeer);
      delete connectionsWaitingForSignalingData[oakNumber];    
   });
   myPeer.signal(signalingData);  
}



describe("Testing if streamVideo method", function(){
   var myStreaming = new OakStreaming();
      
   it("creates streamInformationObject correctly",  function(done){ 
      
      function callback (streamInformationObject){
         //console.log("callback from streamVideo is executed");
         //expect(streamInformationObject.magnetURI).toMatch("magnet:?xt=urn:btih:1b5169e27e943cd615b1e10ba98e9e4a0b2086b8&dn=example.mp4&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io");
         expect(streamInformationObject.videoFileSize).toEqual(theVideoFileSize);
         expect(streamInformationObject.XHRPath).toMatch("/example.mp4");
         //jasmine.clock().uninstall();
         done();
      }
      http.get({
         hostname: 'localhost',
         port: 8080,
         path: '/example.mp4',
         headers: {
            range: 'bytes=' + 0 + '-' + theVideoFileSize-1
         }
      }, function (res){
         testTorrent = myStreaming.streamVideo(res, {XHRPath : "/example.mp4"}, callback, 6257923579344);
      });
   }, 30000); 
});

describe("Testing if loadVideo method", function(){
   var myStreaming = new OakStreaming();
   var myStreaming2 = new OakStreaming();
   var myStreaming3 = new OakStreaming();
   
   it("loads the video fast enough via server delivery", function(done){
      expect(true).toBe(true); // necessary because Jasmine wants at least one expect per it.
      myStreaming.loadVideo({XHRPath : "/example2.mp4", videoFileSize : theVideoFileSize}, done);
   }, 10000);
     
   describe("loads the video fast enough via WebTorrent delivery", function(){
      it("with one seeder and one downloader", function(done){
         expect(true).toBe(true);
         
         req = http.get({
            hostname: 'localhost',
            port: 8080,
            path: "/example.mp4",
            headers: {
                range: 'bytes=' + 0 + '-' + theVideoFileSize-1
            }
         }, function (res) {  
               myStreaming.streamVideo(res, {XHRPath : "/example.mp4"}, function(streamInformationObject){
                  myStreaming2.loadVideo(streamInformationObject, done);  
               });
         });
      }, 15000); 
      
      it("with two seeders and one downloader", function(done){
         expect(true).toBe(true);
         
         function callback(streamInformationObject){
            myStreaming2.loadVideo(streamInformationObject, function(){
               myStreaming3.loadVideo(streamInformationObject, done);
            });
         }
         
         req = http.get({
            hostname: 'localhost',
            port: 8080,
            path: "/example.mp4",
            headers: {
                range: 'bytes=' + 0 + '-' + theVideoFileSize-1
            }
         }, function (res) {  
               myStreaming.streamVideo(res, {XHRPath : "/example.mp4"}, callback);
         });
      }, 20000);  

      it("with one seeder and two downloaders", function(done){
         expect(true).toBe(true);
         var numberOfCompletedDownloads = 0;
         
         function checkIfSpecFinished(){
            if(++numberOfCompletedDownloads >= 2){
               done();
            }
         }       
         function callback(streamInformationObject){
            myStreaming2.loadVideo(streamInformationObject, checkIfSpecFinished); 
            myStreaming3.loadVideo(streamInformationObject, checkIfSpecFinished);
         }       
         req = http.get({
            hostname: 'localhost',
            port: 8080,
            path: "/example.mp4",
            headers: {
                range: 'bytes=' + 0 + '-' + theVideoFileSize-1
            }
         }, function (res) {  
               myStreaming.streamVideo(res, {XHRPath : "/example.mp4"}, callback);
         });
      }, 20000);    
   });
   
   it("loads the video fast enough via peer-assisted delivery", function(done){
      expect(true).toBe(true); // every Jasmine it has to have an expect expression
      req = http.get({
         hostname: 'localhost',
         port: 8080,
         path: "/example.mp4",
         headers: {
             range: 'bytes=' + 0 + '-' + theVideoFileSize-1
         }
      }, function (res) {
         var webTorrentClient = new WebTorrent();
         webTorrentClient.seed(res, function onSeed (torrent){
            myStreaming.loadVideo({XHRPath: "/example3.mp4", magnetURI : torrent.magnetURI, videoFileSize : theVideoFileSize}, done);            
         });
      });
   }, 20000);
});