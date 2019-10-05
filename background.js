//Here goes event handling

//When the extension is first installed, store the necessary variables 
//in the synced storage so they can be used later
chrome.runtime.onInstalled.addListener(function() {
	var g = [];
	chrome.storage.sync.set({groups: g});
});