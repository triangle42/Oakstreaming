var OakStreaming = require("./oakstreaming");
var oakStreaming = new OakStreaming();

var streamSource = false;
var theHtmlVideoTag = document.getElementById("myVideo");  


console.log("This is the live demo");

window.handleFiles = function (files) {
  streamSource = true;
  // files[0] contains the file from the user
  // Maybe useful: webTorrent_trackers: [["wss://tracker.webtorrent.io"]] 
  oakStreaming.create_stream(files[0], { web_server_URL: "localhost:9912", webTorrent_trackers: ["ws://localhost:8085"]}, function(streamInformationObject){      
    console.log(JSON.stringify(streamInformationObject));
  });
};

window.consoleStreamTicket = function consoleStreamTicket(){
  let ticket =  document.getElementById("streamticketTextInput");
  oakStreaming.receive_stream(JSON.parse(ticket.value), theHtmlVideoTag, function () {
    console.log("The full video has been downloaded successfully.")
  });
  return false;
}

function updateChart(){
  document.getElementById("A").innerHTML = "File size in bytes: " + oakStreaming.get_file_size();
  document.getElementById("B").innerHTML = "Bytes downloaded from other peers: " + oakStreaming.get_number_of_bytes_downloaded_P2P();
  document.getElementById("C").innerHTML = "Bytes uploaded to other peers: " + oakStreaming.get_number_of_bytes_uploaded_P2P();
  document.getElementById("D").innerHTML = "Percentage of video file downloaded from P2P network: " + oakStreaming.get_percentage_downloaded_of_torrent();
  document.getElementById("E").innerHTML = "Bytes downloaded from server: " + oakStreaming.get_number_of_bytes_downloaded_from_server();
  setTimeout(updateChart, 50);
}
updateChart(); 