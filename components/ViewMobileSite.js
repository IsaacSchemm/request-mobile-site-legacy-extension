/***********************************************************
XPCOM
***********************************************************/

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/Console.jsm");

// When the user decides to disable or uninstall the add-on, turn the override
// off immediately, instead of waiting for application shutdown. In button.js
// we check the status of the add-on, and prevent the user from turning the
// override back on if the extension is going to be uninstalled or disabled.
AddonManager.addAddonListener({
	onUninstalling: function(addon) {
		if (addon.id == "view-mobile-site@lakora.us") {
			Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("general.useragent.")
				.clearUserPref("override");
		}
	},
	onDisabling: function(addon) {
		if (addon.id == "view-mobile-site@lakora.us") {
			Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("general.useragent.")
				.clearUserPref("override");
		}
	}
});

/***********************************************************
class definition
***********************************************************/

//class constructor
function ViewMobileSite() { }

// class definition
ViewMobileSite.prototype = {

	// properties required for XPCOM registration:
	classDescription: "View Mobile Site",
	classID:          Components.ID("{aefc9d5b-c9c0-4f30-bea3-973928603735}"),
	contractID:	      "@propfire/startup;1",
	QueryInterface:   XPCOMUtils.generateQI([Components.interfaces.nsIObserver]),

	// add to category manager
	_xpcom_categories: [{category: "profile-after-change"}],
	
	prefBranch: null,

	observe: function(aSubject, aTopic, aData)
	{
		switch (aTopic) 
		{
			case "profile-after-change":
				// Set up listeners for the cases below.
				Components.classes["@mozilla.org/observer-service;1"]
					.getService(Components.interfaces.nsIObserverService)
					.addObserver(this, "quit-application", false);
						
				this.prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("general.useragent.");
				this.prefBranch.addObserver("", this, false);
				break;
			case "quit-application":
				// Turn the mobile UA string off when closing the application,
				// regardless of whether or not the add-on is going to be
				// uninstalled.
				Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("general.useragent.")
					.clearUserPref("override");
				break;
			case "nsPref:changed":
				// Don't do anything
				break;
			default:
				throw Components.Exception("Unknown topic: " + aTopic);
		}
	}
};

var components = [ViewMobileSite];  
if (XPCOMUtils.generateNSGetFactory)
{
	var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
}
else
{
	var NSGetModule = XPCOMUtils.generateNSGetModule(components);
}

