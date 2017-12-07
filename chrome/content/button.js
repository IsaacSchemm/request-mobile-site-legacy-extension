/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

this.addEventListener("load", function () {
	RequestMobileSite.prefs = Services.prefs.getBranch("general.useragent.");
	var menuItem = document.getElementById("RequestMobileSiteToolsMenuToggle");

	RequestMobileSite.observerObj = {
		observe: function (aSubject, aTopic, aData) {
			if ("nsPref:changed" == aTopic) {
				var newValue = "";
				try {
					newValue = RequestMobileSite.prefs.getCharPref("override");
				} catch (e) { }

				if (newValue) {
					menuItem.setAttribute("checked", true);
				} else {
					menuItem.setAttribute("checked", false);
				}
				
				// Get tabbrowser
				var elem = menuItem;
				while (elem && elem.tagName != "window") {
					elem = elem.parentNode;
				}
				var tabbrowser = elem && elem.querySelector("tabbrowser");
				if (tabbrowser) setTimeout(() => tabbrowser.reload(), 0);
			}
		}
	};
	
	RequestMobileSite.prefs.addObserver("", RequestMobileSite.observerObj, false);

	var value = "";
	try {
		value = RequestMobileSite.prefs.getCharPref("override");
	} catch (e) { }
	if (value) {
		menuItem.setAttribute("checked", true);
	} else {
		menuItem.setAttribute("checked", false);
	}
});
this.addEventListener("unload", function () {
	RequestMobileSite.prefs.removeObserver("", RequestMobileSite.observerObj);
});

RequestMobileSite = {
	GetString: s => {
		var strings = Components.classes["@mozilla.org/intl/stringbundle;1"]
			.getService(Components.interfaces.nsIStringBundleService)
			.createBundle("chrome://request-mobile-site/locale/request-mobile-site.properties");
		try {
			return strings.GetStringFromName(s);
		} catch (e) {
			if ("console" in window) window.console.log(e);
			return "?";
		}
	},
	Toggle: () => {
		var title = RequestMobileSite.GetString("title");
		AddonManager.getAddonByID("request-mobile-site@lakora.us", addon => {
			var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
				
			if (addon.pendingOperations & (AddonManager.PENDING_DISABLE | AddonManager.PENDING_UNINSTALL)) {
				promptService.alert(this.window, title, RequestMobileSite.GetString("enableOrReinstallRequired"));
			} else {
				var actualValue = "";
				try {
					actualValue = RequestMobileSite.prefs.getCharPref("override");
				} catch (e) { }
				if (actualValue) {
					RequestMobileSite.prefs.clearUserPref("override");
				} else {
					// Get last token of UA string
					var lastToken = /([^ ]+)$/.exec(navigator.userAgent)[1];
					// Get Firefox version, if any; otherwise default to 52
					var fxVersion = /Firefox\/([0-9\.]+)/.exec(navigator.userAgent)[1] || "52.0";
					var ua = "Mozilla/5.0 (Android; Mobile; rv:" + fxVersion + ") Gecko/" + fxVersion + " Firefox/" + fxVersion;
					if (lastToken && !/^Firefox\//.test(lastToken)) {
						ua += " " + lastToken;
					}
					try {
						RequestMobileSite.prefs.setCharPref("override", ua);
					} catch (e) {
						if ("console" in window) window.console.log(e);
					}
				}
			}
		});
	}
}