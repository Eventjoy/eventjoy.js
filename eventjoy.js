var eventjoy = (function () {
	var ej = {};
	var _API_KEY = "";

	function _checkApiKey() {
		if ( !_API_KEY || !_API_KEY.length ) throw "Eventjoy Exception: No API Key provided.";
	}
	function _callAPI() {

	}

	ej.publicVar = 0;
	ej.setApiKey = function (API_KEY) {
		_API_KEY = API_KEY;
	};
	ej.login = function () {
		_checkApiKey();
	};

	return ej;
}());