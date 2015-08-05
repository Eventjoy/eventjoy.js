/*
Copyright 2015 Eventjoy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var eventjoy = (function () {
	var ej = {}, _API_KEY = "", _ACCESS_TOKEN = "", _API_URL = "https://api.eventjoy.com/v1/";

	function _checkApiKey() { if ( !_API_KEY || !_API_KEY.length ) throw "Eventjoy Exception: No API Key provided."; }
	function _checkAccessToken() { if ( !_ACCESS_TOKEN || !_ACCESS_TOKEN.length ) throw "Eventjoy Exception: No Access Token provided."; }
	function _checkCredentials(apikey, access_token) {
		if ( apikey ) _checkApiKey();
		if ( access_token ) _checkAccessToken();
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
	function _apiRequest(url, callbackFunction) {
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
			_checkCredentials(headers['X-API-Key']?1:0, headers['access_token']?1:0);
			that.AJAX = null;
			if (window.XMLHttpRequest) { that.AJAX=new XMLHttpRequest(); }
			else { that.AJAX=new ActiveXObject("Microsoft.XMLHTTP"); }
			if (that.AJAX===null) { return false; }
			else {
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
		var urlCall = _API_URL + url;
		this.callback = callbackFunction || function () { };
	}
	function _onWindowClose(win, onclose) {
		var w = win, cb = onclose, closing = false, t = setTimeout(function() { _onWindowClose(w, cb); }, 500);
		try { if (win.closed || win.top === null) closing = true; } //happens when window is closed in FF/Chrome/Safari
		catch (e) { closing = true; } //happens when window is closed in IE
		if (closing) { clearTimeout(t); onclose(); }
	}

	// Public functions
	ej.setApiKey = function(API_KEY) { _API_KEY = API_KEY; };
	ej.setAccessToken = function(ACCESS_TOKEN) { _ACCESS_TOKEN = ACCESS_TOKEN; };
	ej.login = function(complete) {
		var oauthUrl = 'https://www.eventjoy.com/account/oauth-login?apikey='+_API_KEY;
		newWin = window.open(oauthUrl, '_blank', 'location=no, width=780, height=600, top='+((screen.height/2)-300)+', left='+((screen.width/2)-390));
		_onWindowClose( newWin, function() { complete(); });
	};
	ej.auth = function(token, complete) {
		(new _apiRequest('oauth/token', function(success, jsonResponse) {
			if ( jsonResponse && jsonResponse.access_token ) _ACCESS_TOKEN = jsonResponse.access_token;
			if ( complete ) complete(success, jsonResponse);
		})).execute('POST', {'X-API-Key': _API_KEY, 'X-Request-Token': token}, 'client_id='+encodeURIComponent(_API_KEY)+'&code='+encodeURIComponent(token));
	};
	ej.events = function(event_id, complete) {
		(new _apiRequest('events/'+(event_id||'mine'), complete)).execute('GET', {'X-API-Key': _API_KEY, 'access_token': event_id?null:_ACCESS_TOKEN}, 'include=tickets');
	};
	ej.events_search = function(params, complete) {
		var searchParams = ['sort=-created'];
		for ( p = 0; p < Object.keys(params).length; p++ ) { searchParams.push(Object.keys(params)[p]+"="+params[Object.keys(params)[p]]); }
		(new _apiRequest('events/search', complete)).execute('GET', {'X-API-Key': _API_KEY}, searchParams.join('&'));
	};
	ej.events_tickets = function(event_id, complete) {
		(new _apiRequest('events/'+event_id+'/tickets', complete)).execute('GET', {'X-API-Key': _API_KEY});
	};
	ej.events_orders = function(event_id, complete) {
		(new _apiRequest('events/'+event_id+'/orders', complete)).execute('GET', {'X-API-Key': _API_KEY, 'access_token': _ACCESS_TOKEN});
	};
	ej.events_attendees = function(event_id, complete) {
		(new _apiRequest('events/'+event_id+'/attendees', complete)).execute('GET', {'X-API-Key': _API_KEY, 'access_token': _ACCESS_TOKEN});
	};
	ej.order = function(order_id, complete) {
		(new _apiRequest('orders/'+order_id, complete)).execute('GET', {'X-API-Key': _API_KEY, 'access_token': _ACCESS_TOKEN});
	};
	ej.order_attendees = function(order_id, complete) {
		(new _apiRequest('orders/'+order_id+'/attendees', complete)).execute('GET', {'X-API-Key': _API_KEY, 'access_token': _ACCESS_TOKEN});
	};
	ej.organizer = function(organizer_id, complete) {
		(new _apiRequest('organizer/'+(organizer_id||'mine'), complete)).execute('GET', {'X-API-Key': _API_KEY, 'access_token': organizer_id?null:_ACCESS_TOKEN});
	};
	ej.organizer_events = function(organizer_id, complete) {
		(new _apiRequest('organizer/'+(organizer_id||'mine')+'/events', complete)).execute('GET', {'X-API-Key': _API_KEY});
	};

	return ej;
}());