/*

Public Functions:

eventjoy.setApiKey
eventjoy.setAccessToken
eventjoy.login
eventjoy.auth
eventjoy.events_search
eventjoy.events
eventjoy.events_orders
eventjoy.events_attendees
eventjoy.order
eventjoy.order_attendees

*/

var eventjoy = (function () {
	var ej = {};
	var _API_KEY = "", _ACCESS_TOKEN = "";
	var _API_URL = "https://api.eventjoy.com/v1/";

	function _checkApiKey() {
		if ( !_API_KEY || !_API_KEY.length ) throw "Eventjoy Exception: No API Key provided.";
	}
	function _checkAccessToken() {
		if ( !_ACCESS_TOKEN || !_ACCESS_TOKEN.length ) throw "Eventjoy Exception: No Access Token provided.";
	}
	function _checkResponse(responseText, responseStatus, responseXML) {
		if ( 200 == responseStatus ) return true;
		else switch( responseStatus ) {
			case 400: throw "Eventjoy Exception: 400 Bad Request – Your request was bad."; return false;
			case 401: throw "Eventjoy Exception: 401 Unauthorized – Your API key is wrong."; return false;
			case 403: throw "Eventjoy Exception: 403 Forbidden – The data requested is only accessible by its event organizers."; return false;
			case 404: throw "Eventjoy Exception: 404 Not Found – The specified object could not be found."; return false;
			case 405: throw "Eventjoy Exception: 405 Method Not Allowed – You tried to access data with an invalid method."; return false;
			case 406: throw "Eventjoy Exception: 406 Not Acceptable – You requested a format that isn’t JSON."; return false;
			case 410: throw "Eventjoy Exception: 410 Gone – The object requested has been removed from our server."; return false;
			case 429: throw "Eventjoy Exception: 429 Too Many Requests – Whoa there! You’re requesting too much! Slow down!"; return false;
			case 500: throw "Eventjoy Exception: 500 Internal Server Error – We had a problem with our server. Try again later."; return false;
			case 503: throw "Eventjoy Exception: 503 Service Unavailable - We’re temporarially offline for maintanance. Please try again later."; return false;
		}
		return true;
	}
	// Add custom headers
	function _addHeaders(theAJAX, theHeaders) {
		if ( theHeaders && Object.keys(theHeaders).length ) {
			for ( var h = 0; h < Object.keys(theHeaders).length; h++ ) {
				var key = Object.keys(theHeaders)[h];
				theAJAX.setRequestHeader(key, theHeaders[key]);
			}
		}
	}
	function _ajaxRequest(url, callbackFunction) {
		var that=this;
		this.updating = false;
		this.abort = function() {
			if (that.updating) {
				that.updating=false;
				that.AJAX.abort();
				that.AJAX=null;
			}
		};
		this.execute = function(postMethod, headers, queryParams, passData) {
			if (that.updating) { return false; }
			that.AJAX = null;
			if (window.XMLHttpRequest) {
				that.AJAX=new XMLHttpRequest();
			} else {
				that.AJAX=new ActiveXObject("Microsoft.XMLHTTP");
			}
			if (that.AJAX===null) {
				return false;
			} else {
				that.AJAX.onreadystatechange = function() {
					if (that.AJAX.readyState==4) {
						that.updating=false;

						if ( _checkResponse(that.AJAX.responseText,that.AJAX.status,that.AJAX.responseXML) ) {
							var jsonResponse = null;
							try { jsonResponse = JSON.parse(that.AJAX.responseText); }
							catch(e) { jsonResponse = null; }
							if ( that.callback ) that.callback(true, jsonResponse);
						} else {
							if ( that.callback ) that.callback(false);
						}

						// DEBUGGING
						//if ( that.AJAX.responseText ) console.log(that.AJAX.responseText);
						//if ( that.AJAX.status ) console.log(that.AJAX.status);
						//if ( that.AJAX.responseXML ) console.log(that.AJAX.responseXML);

						that.AJAX=null;
					}
				};

				that.updating = new Date();
				var uri=urlCall;
				if ( queryParams && queryParams.length ) uri+='?'+queryParams+'&timestamp='+(that.updating.getTime());
				else uri+='?timestamp='+(that.updating.getTime());

				if (/post/i.test(postMethod||'GET')) {
					passData = passData||"";
					that.AJAX.open("POST", uri, true);
					that.AJAX.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					that.AJAX.setRequestHeader("Content-Length", passData.length);
					that.AJAX.setRequestHeader("X-API-Client", 'eventjoy.js');
					_addHeaders(that.AJAX, headers);
					that.AJAX.send(passData);
				} else {
					that.AJAX.open("GET", uri, true);
					that.AJAX.setRequestHeader("X-API-Client", 'eventjoy.js');
					_addHeaders(that.AJAX, headers);
					that.AJAX.send(null);
				}
				return true;
			}
		};
		var urlCall = url;
		this.callback = callbackFunction || function () { };
	}
	function _onWindowClose(win, onclose) {
		var w = win;
		var cb = onclose;
		var t = setTimeout(function() { _onWindowClose(w, cb); }, 500);
		var closing = false;
		try {
			if (win.closed || win.top === null) //happens when window is closed in FF/Chrome/Safari
			closing = true;
		} catch (e) { //happens when window is closed in IE
			closing = true;
		}
		if (closing) {
			clearTimeout(t);
			onclose();
		}
	}

	ej.publicVar = 0;
	ej.setApiKey = function(API_KEY) {
		_API_KEY = API_KEY;
	};
	ej.setAccessToken = function(ACCESS_TOKEN) {
		_ACCESS_TOKEN = ACCESS_TOKEN;
	};
	ej.login = function(complete) {
		_checkApiKey();

		var oauthUrl = 'https://www.eventjoy.com/account/oauth-login?apikey='+_API_KEY;
		newWin = window.open(oauthUrl, '_blank', 'location=no, width=780, height=600, top='+((screen.height/2)-300)+', left='+((screen.width/2)-390));
		_onWindowClose( newWin, function() {
			complete();
		});
	};
	ej.auth = function(token, complete) {
		_checkApiKey();

		var loginRequest = new _ajaxRequest(_API_URL+'oauth/token', function(success, jsonResponse) {
			if ( jsonResponse && jsonResponse.access_token ) _ACCESS_TOKEN = jsonResponse.access_token;
			if ( complete ) complete(success, jsonResponse);
		});
		loginRequest.execute('POST', {'X-API-Key': _API_KEY, 'X-Request-Token': token}, 'client_id='+encodeURIComponent(_API_KEY)+'&code='+encodeURIComponent(token));
	};
	ej.events = function(event_id, complete) {
		_checkApiKey();
		
		event_id = event_id||'mine';
		var loginRequest = new _ajaxRequest(_API_URL+'events/'+event_id, complete);
		var headers = {'X-API-Key': _API_KEY};
		if ( _ACCESS_TOKEN && _ACCESS_TOKEN.length ) headers['access_token'] = _ACCESS_TOKEN;
		loginRequest.execute('GET', headers);
	};
	ej.events_search = function(params, complete) {
		_checkApiKey();

		var searchParams = [];
		for ( p = 0; p < Object.keys(params); p++ ) {
			searchParams.push(Object.keys(params)[p]+"="+params[Object.keys(params)[p]]);
		}

		var loginRequest = new _ajaxRequest(_API_URL+'events/search', complete);
		var headers = {'X-API-Key': _API_KEY};
		loginRequest.execute('GET', headers, searchParams.join('&'));
	};
	ej.events_tickets = function(event_id, complete) {
		_checkApiKey();

		event_id = event_id||'mine';
		var loginRequest = new _ajaxRequest(_API_URL+'events/'+event_id+'/tickets', complete);
		loginRequest.execute('GET', {'X-API-Key': _API_KEY});
	};
	ej.events_orders = function(event_id, complete) {
		_checkApiKey();
		_checkAccessToken();

		event_id = event_id||'mine';
		var loginRequest = new _ajaxRequest(_API_URL+'events/'+event_id+'/orders', complete);
		loginRequest.execute('GET', {'X-API-Key': _API_KEY, 'access_token': _ACCESS_TOKEN});
	};
	ej.events_attendees = function(event_id, complete) {
		_checkApiKey();
		_checkAccessToken();

		event_id = event_id||'mine';
		var loginRequest = new _ajaxRequest(_API_URL+'events/'+event_id+'/attendees', complete);
		loginRequest.execute('GET', {'X-API-Key': _API_KEY, 'access_token': _ACCESS_TOKEN});
	};
	ej.order = function(order_id, complete) {
		_checkApiKey();
		_checkAccessToken();

		var loginRequest = new _ajaxRequest(_API_URL+'orders/'+order_id, complete);
		loginRequest.execute('GET', {'X-API-Key': _API_KEY, 'access_token': _ACCESS_TOKEN});
	};
	ej.order_attendees = function(order_id, complete) {
		_checkApiKey();
		_checkAccessToken();

		var loginRequest = new _ajaxRequest(_API_URL+'orders/'+order_id+'/attendees', complete);
		loginRequest.execute('GET', {'X-API-Key': _API_KEY, 'access_token': _ACCESS_TOKEN});
	};

	return ej;
}());