(function() {
	'use strict';

	var L = require('leaflet');
	var corslite = require('corslite');
	var haversine = require('haversine');

	L.Routing = L.Routing || {};

	L.Routing.Here = L.Class.extend({
		options: {
			serviceUrl: 'https://route.cit.api.here.com/routing/7.2/calculateroute.json',
			timeout: 30 * 1000,
			alternatives: 0,
			mode: 'fastest;car',
			urlParameters: {}
		},

		initialize: function(appId, appCode, options) {
			this._appId = appId;
			this._appCode = appCode;
			L.Util.setOptions(this, options);
		},

		route: function(waypoints, callback, context, options) {
			var timedOut = false,
				wps = [],
				url,
				timer,
				wp,
				i;

			options = options || {};
			url = this.buildRouteUrl(waypoints, options);

			timer = setTimeout(function() {
								timedOut = true;
								callback.call(context || callback, {
									status: -1,
									message: 'Here request timed out.'
								});
							}, this.options.timeout);

			// Create a copy of the waypoints, since they
			// might otherwise be asynchronously modified while
			// the request is being processed.
			for (i = 0; i < waypoints.length; i++) {
				wp = waypoints[i];
				wps.push({
					latLng: wp.latLng,
					name: wp.name,
					options: wp.options
				});
			}

			corslite(url, L.bind(function(err, resp) {
				var data;

				clearTimeout(timer);
				if (!timedOut) {
					if (!err) {
						data = JSON.parse(resp.responseText);
						this._routeDone(data, wps, callback, context);
					} else {
						callback.call(context || callback, {
							status: -1,
							message: 'HTTP request failed: ' + err
						});
					}
				}
			}, this));

			return this;
		},

		_routeDone: function(response, inputWaypoints, callback, context) {
			var alts = [],
			    waypoints,
			    waypoint,
			    coordinates,
			    i, j, k,
			    instructions,
			    distance,
			    time,
			    leg,
			    maneuver,
			    startingSearchIndex,
			    instruction,
			    path;

			context = context || callback;
			if (!response.response.route) {
				callback.call(context, {
					// TODO: include all errors
					status: response.type,
					message: response.details
				});
				return;
			}

			for (i = 0; i < response.response.route.length; i++) {
				path = response.response.route[i];
				coordinates = this._decodeGeometry(path.shape);
				startingSearchIndex = 0;

				instructions = [];
				time = 0;
				distance = 0;
				for(j = 0; j < path.leg.length; j++) {
					leg = path.leg[j];
					for(k = 0; k < leg.maneuver.length; k++) {
						maneuver = leg.maneuver[k];
						distance += maneuver.length;
						time += maneuver.travelTime;
						instruction = this._convertInstruction(maneuver, coordinates, startingSearchIndex);
						instructions.push(instruction);
						startingSearchIndex = instruction.index;
					}
				}

				waypoints = [];
				for(j = 0; j < path.waypoint.length; j++) {
					waypoint = path.waypoint[j];
					waypoints.push(new L.LatLng(
						waypoint.mappedPosition.latitude, 
						waypoint.mappedPosition.longitude));
				}

				alts.push({
					name: '',
					coordinates: coordinates,
					instructions: instructions,
					summary: {
						totalDistance: distance,
						totalTime: time,
					},
					inputWaypoints: inputWaypoints,
					waypoints: waypoints
				});
			}

			callback.call(context, null, alts);
		},

		_decodeGeometry: function(geometry) {
			var latlngs = new Array(geometry.length),
				coord,
				i;
			for (i = 0; i < geometry.length; i++) {
				coord = geometry[i].split(",");
				latlngs[i] = ([parseFloat(coord[0]), parseFloat(coord[1])]);
			}

			return latlngs;
		},

		buildRouteUrl: function(waypoints, options) {
			var locs = [],
				i,
				alternatives,
				baseUrl;
			
			for (i = 0; i < waypoints.length; i++) {
				locs.push('waypoint' + i + '=geo!' + waypoints[i].latLng.lat + ',' + waypoints[i].latLng.lng);
			}
			if(waypoints.length > 2) {
				alternatives = 0;
			} else {
				//With more than 1 waypoint, requests for alternatives are invalid
				alternatives = this.options.alternatives;
			}
			baseUrl = this.options.serviceUrl + '?' + locs.join('&');

			return baseUrl + L.Util.getParamString(L.extend({
					instructionFormat: 'text',
					app_code: this._appCode,
					app_id: this._appId,
					representation: "navigation",
					mode: this.options.mode,
					alternatives: alternatives
				}, this.options.urlParameters), baseUrl);
		},

		_convertInstruction: function(instruction, coordinates, startingSearchIndex) {
			var i,
			distance,
			closestDistance = 0,
			closestIndex = -1,
			coordinate = instruction.position;
			if(startingSearchIndex < 0) {
				startingSearchIndex = 0;
			}
			for(i = startingSearchIndex; i < coordinates.length; i++) {
				distance = haversine(coordinate, {latitude:coordinates[0], longitude:coordinates[1]});
				if(distance < closestDistance || closestIndex == -1) {
					closestDistance = distance;
					closestIndex = i;
				}
			}
			return {
				text: instruction.instruction,//text,
				distance: instruction.length,
				time: instruction.travelTime,
				index: closestIndex
				/*
				type: instruction.action,
				road: instruction.roadName,
				*/
			};
		},

	});
	
	L.Routing.here = function(appId, appCode, options) {
		return new L.Routing.Here(appId, appCode, options);
	};

	module.exports = L.Routing.Here;
})();
