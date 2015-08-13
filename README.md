# eventjoy.js

A javascript library for accessing functionality within the [Eventjoy API](https://api.eventjoy.com).

Today, the API is in private beta and you’ll need to request access to get started. We’re doing this so we can work closely with our initial developers to ensure stability, performance, and better understand how our API is being used.

By using our API and Webhooks, you agree to our [API Terms of Service](https://www.eventjoy.com/apiterms).

>  During this time, it’s critical that we receive as much feedback as possible. If you’re working with our API, please send all feedback to developers@eventjoy.com


## Table of Contents

* [Setup](#setup)
  * [`eventjoy.setApiKey(apikey)`](#eventjoysetapikeyapikey)
* [OAuth Functions](#oauth-functions)
  * [`eventjoy.login(complete)`](#eventjoylogincomplete)
  * [`eventjoy.setAccessToken(token)`](#eventjoysetaccesstokentoken)
* [API Functions](#api-functions)
  * [`eventjoy.events_search(params, complete)`](#eventjoyevents_searchparams-complete)
  * [`eventjoy.events(event_id, complete)`](#eventjoyeventsevent_id-complete)
  * [`eventjoy.events_tickets(event_id, params, complete)`](#eventjoyevents_ticketsevent_id-params-complete)
  * [`eventjoy.events_orders(event_id, params, complete)`](#eventjoyevents_ordersevent_id-params-complete)
  * [`eventjoy.events_attendees(event_id, params, complete)`](#eventjoyevents_attendeesevent_id-params-complete)
  * [`eventjoy.order(order_id, complete)`](#eventjoyorderorder_id-complete)
  * [`eventjoy.order_attendees(order_id, params, complete)`](#eventjoyorder_attendeesorder_id-params-complete)
  * [`eventjoy.organizer(organizer_id, complete)`](#eventjoyorganizerorganizer_id-complete)
  * [`eventjoy.organizer_events(organizer_id, params, complete)`](#eventjoyorganizer_eventsorganizer_id-params-complete)
* [Sorting, Paging & Includes](#sorting-paging--includes)
* [Errors & Exceptions](#errors--exceptions)


## Setup

To setup, simply include `eventjoy.js` within the `<head>` section of your page:

``` html
<script type="text/javascript" src="eventjoy.js"></script>
```

Once included, an `eventjoy` object will be available within the global namespace. This object is used for accessing all library functionality.

### eventjoy.setApiKey(apikey)

Next, you must set your developer API key (see the [API Docs](https://api.eventjoy.com/docs#quick-start) for details on obtaining an API key)

``` javascript
eventjoy.setApiKey('<INSERT YOUR API KEY HERE>');
```


***


## OAuth Functions

While authentication is optional, it is necessary for accessing protected data, such as a user's private events and order/attendee information.

### eventjoy.login(complete)

To begin authenticating, you want to prompt the user to allow your app to access their data using `eventjoy.login`. This will automatically open a new window where they can log into Eventjoy (if not currently logged in) and authorize your application.

``` javascript
eventjoy.login(function(success) {
	// The completion function is called when the oauth window is closed
});
```

Upon successful authorization, the user will be redirected to the 'Redirect URL' you specify when creating your Eventjoy application (see the [API Docs](https://api.eventjoy.com) for more details). From your redirect URL you should obtain the `request_token` and convert this to an `access_token` (details here: https://api.eventjoy.com/docs#request-token).

> Note: The `complete` function will be called **anytime** the login/authorization window closes, regardless of whether authorization succeeds. This is your opportunity to fetch the `access_token` you stored when you processed the authorization from your Redirect URL, or report a login error if no `access_token` was found, if appropriate.


### eventjoy.setAccessToken(token)

Once you have a valid `access_token` you can apply this to eventjoy.js using the following call:

``` javascript
eventjoy.setAccessToken( <string containing acquired access token> );
```

You will now be able to access all OAuth-only functions.


***


## API Functions

All API function calls take a `complete` callback as the last parameter. This callback always takes the following format:

``` javascript
function complete(success, jsonResponse) {
	...
}
```


### eventjoy.events_search(params, complete)
**`GET`** [`/events/search`](https://api.eventjoy.com/docs#search-events)

Search for public events using one or more parameters.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| params | `object` | *A JSON object containing [sorting/paging](#sorting-paging--includes) parameters, as well as the search parameters (see below)* |
| complete | `function` | *A block function to receive the JSON response* |

#### Search Parameters

In addition to the [sorting/paging](#sorting-paging--includes) parameters, the event search also supports the following additional parameters:

| Name | Type | Description |
| --- | --- | --- |
| **name** | `string` | (optional) Partial name of event you are searching |
| **description** | `string` | (optional) Partial description of event you are searching |
| **venue** | `string` | (optional) Partial venue name of event you are searching |
| **category** | `string` | (optional) Partial category name of event you are searching |
| **industry** | `string` | (optional) Partial industry info of event you are searching |
| **location[lat]** | `float` | (optional) Latitude of event you are searching |
| **location[long]** | `float` | (optional) Longtitude of event you are searching |
| **location[distance]** | `float` | (optional) Distance of event from lat/long you have specified **[default: 50]** |
| **location[unit]** | `string` | (optional) Distance unit. (available units are km, mi, m, and ft) **[default: mi]** |

#### Example
``` javascript
eventjoy.events_search({'name': 'party', 'sort': '-created'}, function(success, events) {
	...
});
```

The response returned to the `complete` function upon success will match the response example given for the `/events/search` API endpoint here: https://api.eventjoy.com/docs#search-events


***


### eventjoy.events(event_id, params, complete)
**`GET`** [`/events/{event_id}`](https://api.eventjoy.com/docs#get-a-particular-event)

Fetch a particular event by its `event_id` value. You may also use `null` in place of an `event_id` to fetch all events owned by the authenticated user.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| event_id | `integer` | *The numeric event_id of the event (or `null`)* |
| params | `object` | *A JSON object containing [sorting/paging](#sorting-paging--includes) parameters* |
| complete | `function` | *A block function to receive the JSON response* |

> Note: the use of `null` in place of an `event_id` makes this function **OAuth-Only**.

#### Example
``` javascript
// Fetch a single public event with a known event_id (no OAuth required)
eventjoy.events(12345, {'include': 'tickets'}, function(success, events) {
	...
});

// Fetch recent events owned by the authenticated user (requires OAuth)
eventjoy.events(null, {'include': 'tickets', 'sort': '-created'}, function(success, events) {
  ...
});
```

The response returned to the `complete` function upon success will match the response example given for the `/events/{event_id}` API endpoint here: https://api.eventjoy.com/docs#get-a-particular-event


***


### eventjoy.events_tickets(event_id, params, complete)
**`GET`** [`/events/{event_id}/tickets`](https://api.eventjoy.com/docs#get-all-event-tickets-types)

Fetch all ticket types for the specified event.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| event_id | `integer` | *The numeric event_id of the event* |
| params | `object` | *A JSON object containing [sorting/paging](#sorting-paging--includes) parameters* |
| complete | `function` | *A block function to receive the JSON response* |

#### Example
``` javascript
eventjoy.events_tickets(12345, {'sort': '+name'}, function(success, tickets) {
  ...
});
```

The response returned to the `complete` function upon success will match the response example given for the `/events/{event_id}/tickets` API endpoint here: https://api.eventjoy.com/docs#get-all-event-tickets-types


***


### eventjoy.events_orders(event_id, params, complete)
**`GET`** [`/events/{event_id}/orders`](https://api.eventjoy.com/docs#get-all-event-orders)
> Note: This is an **OAuth-only** function

Fetch all completed orders for the specified event.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| event_id | `integer` | *The numeric event_id of the event* |
| params | `object` | *A JSON object containing [sorting/paging](#sorting-paging--includes) parameters* |
| complete | `function` | *A block function to receive the JSON response* |

#### Example
``` javascript
eventjoy.events_orders(12345, {'sort': '-created'}, function(success, orders) {
	...
});
```

The response returned to the `complete` function upon success will match the response example given for the `/events/{event_id}/orders` API endpoint here: https://api.eventjoy.com/docs#get-all-event-orders


***


### eventjoy.events_attendees(event_id, params, complete)
**`GET`** [`/events/{event_id}/attendees`](https://api.eventjoy.com/docs#get-all-event-attendees)
> Note: This is an **OAuth-only** function

Retrieves all attendees attenfind a particular event.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| event_id | `integer` | *The numeric event_id of the event* |
| params | `object` | *A JSON object containing [sorting/paging](#sorting-paging--includes) parameters* |
| complete | `function` | *A block function to receive the JSON response* |

#### Example
``` javascript
eventjoy.events_attendees(12345, {'sort': '-created'}, function(success, attendees) {
	...
});
```

The response returned to the `complete` function upon success will match the response example given for the `/events/{event_id}/attendees` API endpoint here: https://api.eventjoy.com/docs#get-all-event-attendees


***


### eventjoy.order(order_id, complete)
**`GET`** [`/orders/{order_id}`](https://api.eventjoy.com/docs#get-an-order)
> Note: This is an **OAuth-only** function

This endpoint retrieves a specific order through its `order_id`.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| order_id | `integer` | *The numeric order_id of the order to fetch* |
| complete | `function` | *A block function to receive the JSON response* |

#### Example
``` javascript
eventjoy.order(12345, function(success, order) {
	...
});
```

The response returned to the `complete` function upon success will match the response example given for the `/orders/{order_id}` API endpoint here: https://api.eventjoy.com/docs#get-an-order


***


### eventjoy.order_attendees(order_id, params, complete)
**`GET`** [`/orders/{order_id}/attendees`](https://api.eventjoy.com/docs#get-attendees-by-order)
> Note: This is an **OAuth-only** function

Retrieves all attendees registered through an `order_id`.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| order_id | `integer` | *The numeric order_id of the attendees to fetch* |
| params | `object` | *A JSON object containing [sorting/paging](#sorting-paging--includes) parameters* |
| complete | `function` | *A block function to receive the JSON response* |

#### Example
``` javascript
eventjoy.order_attendees(12345, {'sort': '-created'}, function(success, order) {
	...
});
```

The response returned to the `complete` function upon success will match the response example given for the `/orders/{order_id}/attendees` API endpoint here: https://api.eventjoy.com/docs#get-attendees-by-order


***


### eventjoy.organizer(organizer_id, complete)
**`GET`** [`/organizers/{organizer_id}`](https://api.eventjoy.com/docs#get-an-organizer-profile)

Fetch a particular organizer profile by its `organizer_id` value. You may also use `null` in place of an `organizer_id` to fetch all events owned by the authenticated user.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| organizer_id | `integer` | *The numeric organizer_id of the organizer (or `null`)* |
| complete | `function` | *A block function to receive the JSON response* |

> Note: use of `null` makes this function **OAuth-Only**.

#### Example
``` javascript
eventjoy.organizer(12345, function(success, organizer) {
  ...
});
```

The response returned to the `complete` function upon success will match the response example given for the `/organizers/{organizer_id}` API endpoint here: https://api.eventjoy.com/docs#get-an-organizer-profile


***


### eventjoy.organizer_events(organizer_id, params, complete)
**`GET`** [`/organizers/{organizer_id}/events`](https://api.eventjoy.com/docs#get-an-organizer's-events)

Fetch all events owned by the specified organizer. You may also use `null` in place of an `organizer_id` to fetch all events owned by the authenticated user.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| organizer_id | `integer` | *The numeric organizer_id of the organizer (or `null`)* |
| params | `object` | *A JSON object containing [sorting/paging](#sorting-paging--includes) parameters* |
| complete | `function` | *A block function to receive the JSON response* |

> Note: use of `null` in place of an `organizer_id` makes this function **OAuth-Only**.

#### Example
``` javascript
eventjoy.organizer_events(12345, {'sort': '-created'}, function(success, tickets) {
  ...
});
```

The response returned to the `complete` function upon success will match the response example given for the `/organizers/{organizer_id}/events` API endpoint here: https://api.eventjoy.com/docs#get-an-organizer's-events


***


## Sorting, Paging & Includes

For functions that fetch multiple events/orders/attendees, a `params` object is passed as a parameter. This can be used to control the quantity and order of the objects returned.

The following parameters can be used:

| Name | Type | Description |
| --- | --- | --- |
| **page[number]** | `integer` | (optional) Page number. Max page number is calculated based on the number of events and page[size]. |
| **page[size]** | `integer` | (optional) By default, 50 events will be displayed per page. You can change the size to display more or less events per page. |
| **sort** | `string` | (optional) The name of the event property to sort by. A prefix of `+` means ascending, `-` means descending. All events are sorted by created in ascending order at the moment. **[Default: +created]** |
| **include** | `string` | (optional) This allows additional objects to be fetched and attached to the returned data. Possible values are **`tickets`**, **`attendees`** and **`organizer`**. |

#### Example
``` javascript
// Fetch my recently created events, 10 per page, including the ticket information for the events...
eventjoy.events(null, {
  'page[number]': 5,
  'page[size]': 10,
  'sort': '-created',
  'include': 'tickets'
}, function(success, events) {
  ...
});
```


***


## Errors & Exceptions

All failures when communicating with the API will result in an exception being thrown, so it is advisable to use try/catch blocks to handle these exceptions. The following are errors that may be thrown:

- 400 Bad Request – Your request was bad
- 401 Unauthorized – Your API key is wrong
- 403 Forbidden – The data requested is only accessible by its event organizers
- 404 Not Found – The specified object could not be found
- 405 Method Not Allowed – You tried to access data with an invalid method
- 406 Not Acceptable – You requested a format that isn’t JSON
- 410 Gone – The object requested has been removed from our server
- 429 Too Many Requests – Whoa there! You’re requesting too much! Slow down!
- 500 Internal Server Error – We had a problem with our server. Try again later
- 503 Service Unavailable - We’re temporarially offline for maintanance

