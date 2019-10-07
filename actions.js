//callbacks for the controls in the extension and code to be run when the extension is clicked on

class Tab {
	constructor(title, url, iconurl) {
		this.title = title;
		this.url = url;
		this.iconurl = iconurl;
	}
}

class Group {
  constructor() {
  	this.name = "";
    this.tabs = [];
  }

  addTab(tab){
  	this.tabs.push(new Tab(tab.dataset.title,
  						   tab.dataset.url, 
						   tab.dataset.iconurl));
  }

  setName(name){
  	this.name=name;
  }

  getName(){
  	return this.name;
  }

  getTabs(){
  	return this.tabs;
  }
}

newgroup = document.getElementById("newgroup");
newgroup.onclick = openCreateGroup;

savegroup = document.getElementById("savegroup");
savegroup.onclick = saveGroup;

cancelgroup = document.getElementById("cancelgroup");
cancelgroup.onclick = cancelGroup;

buildGroupsList();

function buildGroupsList(){
	//Load saved groups and build a list
	chrome.storage.sync.get('groups', function(result) {
		var groups_list = document.getElementById("groups_list");
		result.groups.forEach(function(element){
			//This element will act as a header, holding the group name and
			//controls
			var newnode  = document.createElement("li");
			var groupname = document.createElement("p");
			var controlsdiv = document.createElement("div");
			var showgroupbutton = document.createElement("input");
			var launchgroupbutton = document.createElement("input");
			var deletegroupbutton = document.createElement("input");

			groupname.innerHTML = element.name;

			newnode.style.display = "flex";
			//1/3 means it will take columns 1 and 2
			/*
			groupname.style.gridColumn = 1/3;
			groupname.style.gridRow = 1;
			showgroupbutton.style.gridColumn = 3;
			showgroupbutton.style.gridRow = 1;
			launchgroupbutton.style.gridColumn = 4;
			launchgroupbutton.style.gridRow = 1;
			deletegroupbutton.style.gridColumn = 5;
			deletegroupbutton.style.gridRow = 1;
			*/
			showgroupbutton.type = "image";
			launchgroupbutton.type = "image";
			deletegroupbutton.type = "image";

			showgroupbutton.src = "/assets/icons/expand_more.png";
			launchgroupbutton.src = "/assets/icons/arrow_upward.png";
			deletegroupbutton.src = "/assets/icons/clear.png";

			showgroupbutton.classList.add("groupbutton");
			launchgroupbutton.classList.add("groupbutton");
			deletegroupbutton.classList.add("groupbutton");

			showgroupbutton.id = "groupshow_" + element.name;
			
			//showgroupbutton.value = "Show";

			//launchgroupbutton.value = "Open";

			//deletegroupbutton.value = "Delete";

			controlsdiv.appendChild(showgroupbutton);
			controlsdiv.appendChild(launchgroupbutton);
			controlsdiv.appendChild(deletegroupbutton);

			controlsdiv.classList.add("groupcontrols");

			newnode.appendChild(groupname);
			newnode.appendChild(controlsdiv);

			showgroupbutton.onclick = function(){showGroup(element.name, element.tabs)};

			launchgroupbutton.onclick = function(){launchGroup(element.tabs)};

			deletegroupbutton.onclick = function(){deleteGroup(element.name)};

			newnode.classList.add("groupheader");

			groups_list.appendChild(newnode);

			//This element will be used to insert the group tabs when the show group 
			//button is pressed
			var newnode  = document.createElement("li");
			newnode.id = "group_" + element.name;

			groups_list.appendChild(newnode);
		});
	});
}

function deleteGroup(name){
	//Removes the group from the synced storage
	chrome.storage.sync.get('groups', function(result) {
	  var newGroups = [];
	  result.groups.forEach(function(element){
	  	if(element.name != name){
	  		newGroups.push(element);
	  	}
	  });
      chrome.storage.sync.set({groups: newGroups}, function(){
      	//Empty and reload the groups list once the new groups have been saved
		var groups_list = document.getElementById("groups_list");

		while( groups_list.firstChild ){
		  groups_list.removeChild( groups_list.firstChild );
		}

		buildGroupsList();

		//Close the group creation menu
		cancelGroup();
      });
    });

}

function launchGroup(tabs){
	//Opens a new tab for each element in the group
	tabs.forEach(function(element){
		chrome.tabs.create({url: element.url});
	});	
}

function showGroup(name, tabs){
	console.log(tabs);
	var groupcontents  = document.createElement("ul");
	groupcontents.style.listStyleType="none"
	tabs.forEach(function(element){
		var newnode  = document.createElement("li");
		var tabinfo = document.createElement("div");
		var tabimg = document.createElement("img");
		var tabtitle = document.createElement("p");

		tabinfo.style.display = "flex";

		tabimg.style.width = "32px";
		tabimg.style.height = "32px";
		tabimg.style.marginRight = "10px";
		tabimg.src = element.iconurl;
		

		tabtitle.innerHTML = element.title;
		tabtitle.style.userSelect = "none";

		tabinfo.appendChild(tabimg);
		tabinfo.appendChild(tabtitle);

		newnode.appendChild(tabinfo);

		//add a handler for when the tab is clicked on
		//newnode.onclick = function(){tabSelected(newnode);}

		newnode.style.padding="2%";

		groupcontents.appendChild(newnode);
	});
	document.getElementById("group_" + name).appendChild(groupcontents);

	//Change the handler associated to the button, so the next press closes the group
	showgroupbutton = document.getElementById("groupshow_" + name);
	showgroupbutton.onclick = function(){hideGroup(name, tabs)};
	showgroupbutton.src = "/assets/icons/expand_less.png";
}

function hideGroup(name, tabs){
	//Remove all tabs from the list
	var tabs_list = document.getElementById("group_" + name);
	while( tabs_list.firstChild ){
	  tabs_list.removeChild( tabs_list.firstChild );
	}
	//Change the handler associated to the button, so the next press shows the group
	showgroupbutton = document.getElementById("groupshow_" + name);
	showgroupbutton.onclick = function(){showGroup(name, tabs)};
	showgroupbutton.src = "/assets/icons/expand_more.png";
}

function cancelGroup(){
	var tabs_list = document.getElementById("tabs_list");
	document.getElementById("groupcreation").style.display="none";

	//Remove all elements from the list
	while( tabs_list.firstChild ){
	  tabs_list.removeChild( tabs_list.firstChild );
	}

	//Hide the alert if it's present
	var groupnamealert = document.getElementById("groupnamealert");
	groupnamealert.style.display="none";

	//Empty the text input for the group name
	var groupname = document.getElementById("groupname");
	groupname.value = "";

}

function saveGroup(){
	group = new Group();

	var tabs_list = document.getElementById("tabs_list");
	var groupname = document.getElementById("groupname");

	//If the groupname text input is empty, show an alert and don't save the group
	if(groupname.value.trim() == ""){
		var groupnamealert = document.getElementById("groupnamealert");
		groupnamealert.innerHTML = "* This field can't be empty";
		groupnamealert.style.display="block";
		return;
	};

	//If the groupname text input is duplicated, show an alert and don't save the group
	if(document.getElementById("group_" + groupname.value.trim()) != null){
		var groupnamealert = document.getElementById("groupnamealert");
		groupnamealert.innerHTML = "* That name already exists";
		groupnamealert.style.display="block";
		return;
	};

	group.setName(groupname.value.trim());

	tabs_list.childNodes.forEach(function(element){
		if(element.dataset.selected == "1"){
			group.addTab(element);
		}
	});

	chrome.storage.sync.get('groups', function(result) {
          result.groups.push(group);
          chrome.storage.sync.set({groups: result.groups}, function(){
          	//Empty and reload the groups list once the group has been saved
			var groups_list = document.getElementById("groups_list");

			while( groups_list.firstChild ){
			  groups_list.removeChild( groups_list.firstChild );
			}

			buildGroupsList();

			//Close the group creation menu
			cancelGroup();
          });
        });
}

function openCreateGroup(){
	document.getElementById("groupcreation").style.display="block";
	//This function returns an array of windows. Each window contains an array of tabs
	chrome.windows.getAll({"populate" : true}, fillTabsList);
}

function fillTabsList(windowsArray){
	var tabs_list = document.getElementById("tabs_list");
	//console.log(windowsArray);
	var tabsArray = [];
	windowsArray.forEach(function(element){
		tabsArray = tabsArray.concat(element.tabs);
	});
	tabsArray.forEach(function(element){
		var newnode  = document.createElement("li");
		var tabinfo = document.createElement("div");
		var tabimg = document.createElement("img");
		var tabtitle = document.createElement("p");

		tabinfo.style.display = "flex";

		tabimg.style.width = "32px";
		tabimg.style.height = "32px";
		tabimg.style.marginRight = "10px";
		tabimg.src = element.favIconUrl;
		

		tabtitle.innerHTML = element.title;
		tabtitle.style.userSelect = "none";

		tabinfo.appendChild(tabimg);
		tabinfo.appendChild(tabtitle);

		newnode.appendChild(tabinfo);

		//Store necessary information
		newnode.setAttribute("data-url", element.url);
		newnode.setAttribute("data-title", element.title);
		newnode.setAttribute("data-iconurl", element.favIconUrl);
		newnode.setAttribute("data-selected", 0);

		//add a handler for when the tab is clicked on
		newnode.onclick = function(){tabSelected(newnode);}

		newnode.style.padding="2%";

		tabs_list.appendChild(newnode);
	});
}

function tabSelected(tab){
	//alert(tab.dataset.title);
	if(tab.dataset.selected == "0"){
		tab.style.backgroundColor="lightblue";
		tab.dataset.selected = "1";
	}else{
		tab.style.backgroundColor="white";
		tab.dataset.selected = "0";
	}
}