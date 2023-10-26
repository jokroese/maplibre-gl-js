import {pick, extend} from '../util/util';

import {getJSON} from '../util/ajax';
import {ResourceType} from '../util/request_manager';
import {browser} from '../util/browser';

import type {RequestManager} from '../util/request_manager';
import type {Callback} from '../types/callback';
import type {TileJSON} from '../types/tilejson';
import type {Cancelable} from '../types/cancelable';
import type {RasterDEMSourceSpecification, RasterSourceSpecification, VectorSourceSpecification} from '@maplibre/maplibre-gl-style-spec';

export function loadTileJson(
    options: RasterSourceSpecification | RasterDEMSourceSpecification | VectorSourceSpecification,
    requestManager: RequestManager,
    callback: Callback<TileJSON>
): Cancelable {
    const loaded = function(err: Error, tileJSON?: any) {
        if (err) {
            return ;
        } else if (tileJSON) {
            const result: any = pick(
                // explicit source options take precedence over TileJSON
                extend(tileJSON, options),
                ['tiles', 'minzoom', 'maxzoom', 'attribution', 'bounds', 'scheme', 'tileSize', 'encoding']
            );

            if (tileJSON.vector_layers) {
                result.vectorLayers = tileJSON.vector_layers;
                result.vectorLayerIds = result.vectorLayers.map((layer) => { return layer.id; });
            }

            callback(null, result);
        }
    };

    if (options.url) {
        getJSON(requestManager.transformRequest(options.url, ResourceType.Source))
            .then(data => loaded(null, data))
            .catch(err => loaded(err));
    } else {
        return browser.frame(() => loaded(null, options));
    }
}
