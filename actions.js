//callbacks for the controls in the extension and code to be run when the extension is clicked on
//import {MDCRipple} from '@material/ripple';

//const fabRipple = new MDCRipple(document.querySelector('.mdc-fab'));

const listCheckbox = `<span class="mdc-list-item__graphic">
      <div class="mdc-checkbox">
        <input type="checkbox"
                class="mdc-checkbox__native-control"
                id="tab_checkbox"/>
        <div class="mdc-checkbox__background">
          <svg class="mdc-checkbox__checkmark"
                viewBox="0 0 24 24">
            <path class="mdc-checkbox__checkmark-path"
                  fill="none"
                  d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
          </svg>
          <div class="mdc-checkbox__mixedmark"></div>
        </div>
      </div>
    </span>`;

const moreIcon = `<i class="material-icons groupicon">
				expand_more
				</i>`;
const lessIcon = `<i class="material-icons groupicon">
				expand_less
				</i>`;
const openIcon = `<i class="material-icons groupicon">
				open_in_browser
				</i>`;
const deleteIcon = `<i class="material-icons groupicon">
					delete
					</i>`;
const cancelIcon = `<i class="material-icons groupicon">
					remove
					</i>`

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

/*
document.getElementsByTagName("body")[0].onresize = tweakWidthForScrollbar;

function tweakWidthForScrollbar() {
  var db = document.body;
  var scrollBarWidth = db.scrollHeight > db.clientHeight ?
      db.clientWidth - db.offsetWidth : 0;

  console.log(scrollBarWidth);

  db.style.paddingRight = scrollBarWidth + "px";
}
*/

function buildGroupsList(){
	//Load saved groups and build a list
	chrome.storage.sync.get('groups', function(result) {

		var groups_list = document.getElementById("groups_list");
		
		result.groups.forEach(function(element){
			//This element will act as a header, holding the group name and
			//controls
			var newnode  = document.createElement("li");
			var groupname = document.createElement("span");
			var controlsdiv = document.createElement("div");
			var showgroupbutton = document.createElement("button");
			var launchgroupbutton = document.createElement("button");
			var deletegroupbutton = document.createElement("button");

			groupname.innerHTML = element.name;
			groupname.classList.add("groupname");
			groupname.classList.add("mdc-list-item__text");

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
			/*
			showgroupbutton.type = "image";
			launchgroupbutton.type = "image";
			deletegroupbutton.type = "image";

			showgroupbutton.src = "/assets/icons/expand_more_fit.png";
			launchgroupbutton.src = "/assets/icons/arrow_upward_fit.png";
			deletegroupbutton.src = "/assets/icons/clear_fit.png";

			*/
			showgroupbutton.classList.add("groupbutton");
			launchgroupbutton.classList.add("groupbutton");
			deletegroupbutton.classList.add("groupbutton");

			showgroupbutton.classList.add("mdc-button");
			launchgroupbutton.classList.add("mdc-button");
			deletegroupbutton.classList.add("mdc-button");

			showgroupbutton.id = "groupshow_" + element.name;

			showgroupbutton.innerHTML = moreIcon;
			launchgroupbutton.innerHTML = openIcon;
			deletegroupbutton.innerHTML = deleteIcon;

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
			newnode.classList.add("mdc-list-item");

			newnode.id = "group_header_" + element.name;

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
	var groupcontents  = document.createElement("ul");
	groupcontents.style.listStyleType="none"
	groupcontents.classList.add("mdc-list-item__text");

	tabs.forEach(function(element){
		var newnode  = document.createElement("li");
		//var tabinfo = document.createElement("div");
		var tabimg = document.createElement("img");
		var tabtitle = document.createElement("span");
		var deleteButton = document.createElement("button");

		//tabinfo.style.display = "flex";

		tabimg.style.width = "32px";
		tabimg.style.height = "32px";
		tabimg.style.marginRight = "10px";
		tabimg.src = element.iconurl;
		

		tabtitle.innerHTML = element.title;
		tabtitle.style.userSelect = "none";
		tabtitle.classList.add("mdc-list-item__text");

		deleteButton.classList.add("tab_delete_button");
		deleteButton.classList.add("mdc-button");
		deleteButton.classList.add("groupbutton");
		deleteButton.innerHTML = cancelIcon;
		deleteButton.onclick = function(){removeTab(name, element.url, newnode, tabs)};

		newnode.appendChild(tabimg);
		newnode.appendChild(tabtitle);
		newnode.appendChild(deleteButton);

		//newnode.appendChild(tabinfo);

		//add a handler for when the tab is clicked on
		//newnode.onclick = function(){tabSelected(newnode);}

		newnode.setAttribute("data-url", element.url);
		newnode.style.padding="2%";
		newnode.classList.add("mdc-list-item");

		groupcontents.appendChild(newnode);

	});
	document.getElementById("group_" + name).appendChild(groupcontents);

	//Change the handler associated to the button, so the next press closes the group
	showgroupbutton = document.getElementById("groupshow_" + name);
	showgroupbutton.onclick = function(){hideGroup(name, tabs)};
	showgroupbutton.innerHTML = lessIcon;
}

function removeTab(name, url, listitem, tabs){
	//Remove the tab from the group and update the synced storage,
	//remove the list item. 

	listitem.remove();
	
	chrome.storage.sync.get('groups', function(result) {
      result.groups
      var group_index=0;

      for(let i=0; i<result.groups.length; i++){
      	if(result.groups[i].name == name){
      		group_index = i;
      		break;
      	}
      }

      //This will remove the first entry if there are duplicated elements
      for(let i=0; i<result.groups[group_index].tabs.length; i++){
      	if(result.groups[group_index].tabs[i].url == url){
      		result.groups[group_index].tabs.splice(i,1);
      		break;
      	}
      }
      
      chrome.storage.sync.set({groups: result.groups});
    });

	var tabs_index = 0;
    for(let i=0; i<tabs.length; i++){
      	if(tabs[i].url == url){
      		tabs_index = i;
      		break;
      	}
      }

    tabs.splice(tabs_index, 1);

    var parent = document.getElementById("group_header_" + name);
    parent.getElementsByTagName("button")[0].onclick = function(){hideGroup(name, tabs)};

    //listitem.parentElement.tabs.splice(tab_index, 1);

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
	showgroupbutton.innerHTML = moreIcon;
}

function cancelGroup(){
	var tabs_list = document.getElementById("tabs_list");
	document.getElementById("groupcreationcontrols").style.display="none";

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

	//Show the groups list
	document.getElementById("groups_list").style.display="block";

	//Animate the FAB into view
	document.getElementById("newgroup").classList.remove("mdc-fab--exited");

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
	document.getElementById("groupcreationcontrols").style.display="flex";
	//Animate the FAB out of view
	document.getElementById("newgroup").classList.add("mdc-fab--exited");

	//Hide the groups list
	document.getElementById("groups_list").style.display="none";

	//Change the header
	document.getElementById("headertext").innerHTML="Group Creation";

	//document.getElementById("groupcreation").style.height=0;
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
		//var tabinfo = document.createElement("div");
		var tabimg = document.createElement("img");
		var tabtitle = document.createElement("span");

		//tabinfo.style.display = "flex";

		tabimg.style.width = "32px";
		tabimg.style.height = "32px";
		tabimg.style.marginRight = "10px";
		tabimg.src = element.favIconUrl;
		
		//If an item is too long, remove the trailing and add "..." at the end
		if(element.title.length > 30){
			tabtitle.innerHTML = element.title.slice(0, 30) + "...";
		}else{
			tabtitle.innerHTML = element.title;
		}
		tabtitle.style.userSelect = "none";
		tabtitle.classList.add("mdc-list-item__text");

		//tabinfo.appendChild(tabimg);
		//tabinfo.appendChild(tabtitle);


		newnode.innerHTML = listCheckbox;
		//newnode.appendChild(tabinfo);
		newnode.appendChild(tabimg);
		newnode.appendChild(tabtitle);

		//Store necessary information
		newnode.setAttribute("data-url", element.url);
		newnode.setAttribute("data-title", element.title);
		newnode.setAttribute("data-iconurl", element.favIconUrl);
		newnode.setAttribute("data-selected", 0);

		//add a handler for when the tab is clicked on
		newnode.onclick = function(){tabSelected(newnode);}

		newnode.style.padding="2%";

		newnode.classList.add("mdc-list-item");
		newnode.classList.add("mdc-ripple-surface");

		tabs_list.appendChild(newnode);
	});
}

function tabSelected(tab){
	//alert(tab.dataset.title);
	tabCheckbox = tab.getElementsByTagName("input")[0];
	if(tab.dataset.selected == "0"){
		//tab.style.backgroundColor="lightgrey";
		tab.dataset.selected = "1";
		tabCheckbox.checked = true;
	}else{
		//tab.style.backgroundColor="white";
		tab.dataset.selected = "0";
		tabCheckbox.checked = false;
	}
	
	/*
	if(tabCheckbox.checked){
		tabCheckbox.checked = false;
	}else{
		tabCheckbox.checked = true;
	}
	*/
}