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
			var showgroupbutton = document.createElement("button");

			groupname.innerHTML = element.name;

			newnode.style.display = "grid";
			//1/3 means it will take columns 1 and 2
			groupname.style.gridColumn = 1/3;
			groupname.style.gridRow = 1;
			showgroupbutton.style.gridColumn = 3;
			showgroupbutton.style.gridRow = 1;
			newnode.appendChild(groupname);
			newnode.appendChild(showgroupbutton);

			showgroupbutton.onclick = function(){showGroup(element.name, element.tabs)};

			groups_list.appendChild(newnode);

			//This element will be used to insert the group tabs when the show group 
			//button is pressed
			var newnode  = document.createElement("li");
			newnode.id = "group_" + element.name;
			groups_list.appendChild(newnode);
		});
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
}

function cancelGroup(){
	var tabs_list = document.getElementById("tabs_list");
	document.getElementById("groupcreation").style.display="none";

	//Remove all elements from the list
	while( tabs_list.firstChild ){
	  tabs_list.removeChild( tabs_list.firstChild );
	}
}

function saveGroup(){
	group = new Group();

	var tabs_list = document.getElementById("tabs_list");
	var groupname = document.getElementById("groupname");

	group.setName(groupname.value);

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