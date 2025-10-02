/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.cfk_poc = (function() {

    /**
     * Namespace cfk_poc.
     * @exports cfk_poc
     * @namespace
     */
    var cfk_poc = {};

    cfk_poc.pipeline = (function() {

        /**
         * Namespace pipeline.
         * @memberof cfk_poc
         * @namespace
         */
        var pipeline = {};

        pipeline.DataRow = (function() {

            /**
             * Properties of a DataRow.
             * @memberof cfk_poc.pipeline
             * @interface IDataRow
             * @property {number|null} [rowNumber] DataRow rowNumber
             * @property {Object.<string,string>|null} [fields] DataRow fields
             * @property {string|null} [rawData] DataRow rawData
             */

            /**
             * Constructs a new DataRow.
             * @memberof cfk_poc.pipeline
             * @classdesc Represents a DataRow.
             * @implements IDataRow
             * @constructor
             * @param {cfk_poc.pipeline.IDataRow=} [properties] Properties to set
             */
            function DataRow(properties) {
                this.fields = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DataRow rowNumber.
             * @member {number} rowNumber
             * @memberof cfk_poc.pipeline.DataRow
             * @instance
             */
            DataRow.prototype.rowNumber = 0;

            /**
             * DataRow fields.
             * @member {Object.<string,string>} fields
             * @memberof cfk_poc.pipeline.DataRow
             * @instance
             */
            DataRow.prototype.fields = $util.emptyObject;

            /**
             * DataRow rawData.
             * @member {string} rawData
             * @memberof cfk_poc.pipeline.DataRow
             * @instance
             */
            DataRow.prototype.rawData = "";

            /**
             * Creates a new DataRow instance using the specified properties.
             * @function create
             * @memberof cfk_poc.pipeline.DataRow
             * @static
             * @param {cfk_poc.pipeline.IDataRow=} [properties] Properties to set
             * @returns {cfk_poc.pipeline.DataRow} DataRow instance
             */
            DataRow.create = function create(properties) {
                return new DataRow(properties);
            };

            /**
             * Encodes the specified DataRow message. Does not implicitly {@link cfk_poc.pipeline.DataRow.verify|verify} messages.
             * @function encode
             * @memberof cfk_poc.pipeline.DataRow
             * @static
             * @param {cfk_poc.pipeline.IDataRow} message DataRow message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataRow.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.rowNumber != null && Object.hasOwnProperty.call(message, "rowNumber"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.rowNumber);
                if (message.fields != null && Object.hasOwnProperty.call(message, "fields"))
                    for (var keys = Object.keys(message.fields), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.fields[keys[i]]).ldelim();
                if (message.rawData != null && Object.hasOwnProperty.call(message, "rawData"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.rawData);
                return writer;
            };

            /**
             * Encodes the specified DataRow message, length delimited. Does not implicitly {@link cfk_poc.pipeline.DataRow.verify|verify} messages.
             * @function encodeDelimited
             * @memberof cfk_poc.pipeline.DataRow
             * @static
             * @param {cfk_poc.pipeline.IDataRow} message DataRow message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataRow.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DataRow message from the specified reader or buffer.
             * @function decode
             * @memberof cfk_poc.pipeline.DataRow
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {cfk_poc.pipeline.DataRow} DataRow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataRow.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cfk_poc.pipeline.DataRow(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.rowNumber = reader.int32();
                            break;
                        }
                    case 2: {
                            if (message.fields === $util.emptyObject)
                                message.fields = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = "";
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.fields[key] = value;
                            break;
                        }
                    case 3: {
                            message.rawData = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DataRow message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof cfk_poc.pipeline.DataRow
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {cfk_poc.pipeline.DataRow} DataRow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataRow.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DataRow message.
             * @function verify
             * @memberof cfk_poc.pipeline.DataRow
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DataRow.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.rowNumber != null && message.hasOwnProperty("rowNumber"))
                    if (!$util.isInteger(message.rowNumber))
                        return "rowNumber: integer expected";
                if (message.fields != null && message.hasOwnProperty("fields")) {
                    if (!$util.isObject(message.fields))
                        return "fields: object expected";
                    var key = Object.keys(message.fields);
                    for (var i = 0; i < key.length; ++i)
                        if (!$util.isString(message.fields[key[i]]))
                            return "fields: string{k:string} expected";
                }
                if (message.rawData != null && message.hasOwnProperty("rawData"))
                    if (!$util.isString(message.rawData))
                        return "rawData: string expected";
                return null;
            };

            /**
             * Creates a DataRow message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof cfk_poc.pipeline.DataRow
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {cfk_poc.pipeline.DataRow} DataRow
             */
            DataRow.fromObject = function fromObject(object) {
                if (object instanceof $root.cfk_poc.pipeline.DataRow)
                    return object;
                var message = new $root.cfk_poc.pipeline.DataRow();
                if (object.rowNumber != null)
                    message.rowNumber = object.rowNumber | 0;
                if (object.fields) {
                    if (typeof object.fields !== "object")
                        throw TypeError(".cfk_poc.pipeline.DataRow.fields: object expected");
                    message.fields = {};
                    for (var keys = Object.keys(object.fields), i = 0; i < keys.length; ++i)
                        message.fields[keys[i]] = String(object.fields[keys[i]]);
                }
                if (object.rawData != null)
                    message.rawData = String(object.rawData);
                return message;
            };

            /**
             * Creates a plain object from a DataRow message. Also converts values to other types if specified.
             * @function toObject
             * @memberof cfk_poc.pipeline.DataRow
             * @static
             * @param {cfk_poc.pipeline.DataRow} message DataRow
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DataRow.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.fields = {};
                if (options.defaults) {
                    object.rowNumber = 0;
                    object.rawData = "";
                }
                if (message.rowNumber != null && message.hasOwnProperty("rowNumber"))
                    object.rowNumber = message.rowNumber;
                var keys2;
                if (message.fields && (keys2 = Object.keys(message.fields)).length) {
                    object.fields = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.fields[keys2[j]] = message.fields[keys2[j]];
                }
                if (message.rawData != null && message.hasOwnProperty("rawData"))
                    object.rawData = message.rawData;
                return object;
            };

            /**
             * Converts this DataRow to JSON.
             * @function toJSON
             * @memberof cfk_poc.pipeline.DataRow
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DataRow.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DataRow
             * @function getTypeUrl
             * @memberof cfk_poc.pipeline.DataRow
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DataRow.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/cfk_poc.pipeline.DataRow";
            };

            return DataRow;
        })();

        pipeline.DataChunk = (function() {

            /**
             * Properties of a DataChunk.
             * @memberof cfk_poc.pipeline
             * @interface IDataChunk
             * @property {string|null} [jobId] DataChunk jobId
             * @property {string|null} [orgId] DataChunk orgId
             * @property {string|null} [sourceId] DataChunk sourceId
             * @property {number|null} [chunkNumber] DataChunk chunkNumber
             * @property {Array.<cfk_poc.pipeline.IDataRow>|null} [rows] DataChunk rows
             */

            /**
             * Constructs a new DataChunk.
             * @memberof cfk_poc.pipeline
             * @classdesc Represents a DataChunk.
             * @implements IDataChunk
             * @constructor
             * @param {cfk_poc.pipeline.IDataChunk=} [properties] Properties to set
             */
            function DataChunk(properties) {
                this.rows = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DataChunk jobId.
             * @member {string} jobId
             * @memberof cfk_poc.pipeline.DataChunk
             * @instance
             */
            DataChunk.prototype.jobId = "";

            /**
             * DataChunk orgId.
             * @member {string} orgId
             * @memberof cfk_poc.pipeline.DataChunk
             * @instance
             */
            DataChunk.prototype.orgId = "";

            /**
             * DataChunk sourceId.
             * @member {string} sourceId
             * @memberof cfk_poc.pipeline.DataChunk
             * @instance
             */
            DataChunk.prototype.sourceId = "";

            /**
             * DataChunk chunkNumber.
             * @member {number} chunkNumber
             * @memberof cfk_poc.pipeline.DataChunk
             * @instance
             */
            DataChunk.prototype.chunkNumber = 0;

            /**
             * DataChunk rows.
             * @member {Array.<cfk_poc.pipeline.IDataRow>} rows
             * @memberof cfk_poc.pipeline.DataChunk
             * @instance
             */
            DataChunk.prototype.rows = $util.emptyArray;

            /**
             * Creates a new DataChunk instance using the specified properties.
             * @function create
             * @memberof cfk_poc.pipeline.DataChunk
             * @static
             * @param {cfk_poc.pipeline.IDataChunk=} [properties] Properties to set
             * @returns {cfk_poc.pipeline.DataChunk} DataChunk instance
             */
            DataChunk.create = function create(properties) {
                return new DataChunk(properties);
            };

            /**
             * Encodes the specified DataChunk message. Does not implicitly {@link cfk_poc.pipeline.DataChunk.verify|verify} messages.
             * @function encode
             * @memberof cfk_poc.pipeline.DataChunk
             * @static
             * @param {cfk_poc.pipeline.IDataChunk} message DataChunk message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataChunk.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.jobId != null && Object.hasOwnProperty.call(message, "jobId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.jobId);
                if (message.orgId != null && Object.hasOwnProperty.call(message, "orgId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.orgId);
                if (message.sourceId != null && Object.hasOwnProperty.call(message, "sourceId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.sourceId);
                if (message.chunkNumber != null && Object.hasOwnProperty.call(message, "chunkNumber"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.chunkNumber);
                if (message.rows != null && message.rows.length)
                    for (var i = 0; i < message.rows.length; ++i)
                        $root.cfk_poc.pipeline.DataRow.encode(message.rows[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified DataChunk message, length delimited. Does not implicitly {@link cfk_poc.pipeline.DataChunk.verify|verify} messages.
             * @function encodeDelimited
             * @memberof cfk_poc.pipeline.DataChunk
             * @static
             * @param {cfk_poc.pipeline.IDataChunk} message DataChunk message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DataChunk.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DataChunk message from the specified reader or buffer.
             * @function decode
             * @memberof cfk_poc.pipeline.DataChunk
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {cfk_poc.pipeline.DataChunk} DataChunk
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataChunk.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cfk_poc.pipeline.DataChunk();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.jobId = reader.string();
                            break;
                        }
                    case 2: {
                            message.orgId = reader.string();
                            break;
                        }
                    case 3: {
                            message.sourceId = reader.string();
                            break;
                        }
                    case 4: {
                            message.chunkNumber = reader.int32();
                            break;
                        }
                    case 5: {
                            if (!(message.rows && message.rows.length))
                                message.rows = [];
                            message.rows.push($root.cfk_poc.pipeline.DataRow.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DataChunk message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof cfk_poc.pipeline.DataChunk
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {cfk_poc.pipeline.DataChunk} DataChunk
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DataChunk.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DataChunk message.
             * @function verify
             * @memberof cfk_poc.pipeline.DataChunk
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DataChunk.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.jobId != null && message.hasOwnProperty("jobId"))
                    if (!$util.isString(message.jobId))
                        return "jobId: string expected";
                if (message.orgId != null && message.hasOwnProperty("orgId"))
                    if (!$util.isString(message.orgId))
                        return "orgId: string expected";
                if (message.sourceId != null && message.hasOwnProperty("sourceId"))
                    if (!$util.isString(message.sourceId))
                        return "sourceId: string expected";
                if (message.chunkNumber != null && message.hasOwnProperty("chunkNumber"))
                    if (!$util.isInteger(message.chunkNumber))
                        return "chunkNumber: integer expected";
                if (message.rows != null && message.hasOwnProperty("rows")) {
                    if (!Array.isArray(message.rows))
                        return "rows: array expected";
                    for (var i = 0; i < message.rows.length; ++i) {
                        var error = $root.cfk_poc.pipeline.DataRow.verify(message.rows[i]);
                        if (error)
                            return "rows." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a DataChunk message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof cfk_poc.pipeline.DataChunk
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {cfk_poc.pipeline.DataChunk} DataChunk
             */
            DataChunk.fromObject = function fromObject(object) {
                if (object instanceof $root.cfk_poc.pipeline.DataChunk)
                    return object;
                var message = new $root.cfk_poc.pipeline.DataChunk();
                if (object.jobId != null)
                    message.jobId = String(object.jobId);
                if (object.orgId != null)
                    message.orgId = String(object.orgId);
                if (object.sourceId != null)
                    message.sourceId = String(object.sourceId);
                if (object.chunkNumber != null)
                    message.chunkNumber = object.chunkNumber | 0;
                if (object.rows) {
                    if (!Array.isArray(object.rows))
                        throw TypeError(".cfk_poc.pipeline.DataChunk.rows: array expected");
                    message.rows = [];
                    for (var i = 0; i < object.rows.length; ++i) {
                        if (typeof object.rows[i] !== "object")
                            throw TypeError(".cfk_poc.pipeline.DataChunk.rows: object expected");
                        message.rows[i] = $root.cfk_poc.pipeline.DataRow.fromObject(object.rows[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a DataChunk message. Also converts values to other types if specified.
             * @function toObject
             * @memberof cfk_poc.pipeline.DataChunk
             * @static
             * @param {cfk_poc.pipeline.DataChunk} message DataChunk
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DataChunk.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.rows = [];
                if (options.defaults) {
                    object.jobId = "";
                    object.orgId = "";
                    object.sourceId = "";
                    object.chunkNumber = 0;
                }
                if (message.jobId != null && message.hasOwnProperty("jobId"))
                    object.jobId = message.jobId;
                if (message.orgId != null && message.hasOwnProperty("orgId"))
                    object.orgId = message.orgId;
                if (message.sourceId != null && message.hasOwnProperty("sourceId"))
                    object.sourceId = message.sourceId;
                if (message.chunkNumber != null && message.hasOwnProperty("chunkNumber"))
                    object.chunkNumber = message.chunkNumber;
                if (message.rows && message.rows.length) {
                    object.rows = [];
                    for (var j = 0; j < message.rows.length; ++j)
                        object.rows[j] = $root.cfk_poc.pipeline.DataRow.toObject(message.rows[j], options);
                }
                return object;
            };

            /**
             * Converts this DataChunk to JSON.
             * @function toJSON
             * @memberof cfk_poc.pipeline.DataChunk
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DataChunk.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DataChunk
             * @function getTypeUrl
             * @memberof cfk_poc.pipeline.DataChunk
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DataChunk.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/cfk_poc.pipeline.DataChunk";
            };

            return DataChunk;
        })();

        pipeline.ProgressUpdate = (function() {

            /**
             * Properties of a ProgressUpdate.
             * @memberof cfk_poc.pipeline
             * @interface IProgressUpdate
             * @property {string|null} [jobId] ProgressUpdate jobId
             * @property {string|null} [serviceName] ProgressUpdate serviceName
             * @property {number|null} [processedCount] ProgressUpdate processedCount
             * @property {number|null} [totalRows] ProgressUpdate totalRows
             */

            /**
             * Constructs a new ProgressUpdate.
             * @memberof cfk_poc.pipeline
             * @classdesc Represents a ProgressUpdate.
             * @implements IProgressUpdate
             * @constructor
             * @param {cfk_poc.pipeline.IProgressUpdate=} [properties] Properties to set
             */
            function ProgressUpdate(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ProgressUpdate jobId.
             * @member {string} jobId
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @instance
             */
            ProgressUpdate.prototype.jobId = "";

            /**
             * ProgressUpdate serviceName.
             * @member {string} serviceName
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @instance
             */
            ProgressUpdate.prototype.serviceName = "";

            /**
             * ProgressUpdate processedCount.
             * @member {number} processedCount
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @instance
             */
            ProgressUpdate.prototype.processedCount = 0;

            /**
             * ProgressUpdate totalRows.
             * @member {number} totalRows
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @instance
             */
            ProgressUpdate.prototype.totalRows = 0;

            /**
             * Creates a new ProgressUpdate instance using the specified properties.
             * @function create
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @static
             * @param {cfk_poc.pipeline.IProgressUpdate=} [properties] Properties to set
             * @returns {cfk_poc.pipeline.ProgressUpdate} ProgressUpdate instance
             */
            ProgressUpdate.create = function create(properties) {
                return new ProgressUpdate(properties);
            };

            /**
             * Encodes the specified ProgressUpdate message. Does not implicitly {@link cfk_poc.pipeline.ProgressUpdate.verify|verify} messages.
             * @function encode
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @static
             * @param {cfk_poc.pipeline.IProgressUpdate} message ProgressUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProgressUpdate.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.jobId != null && Object.hasOwnProperty.call(message, "jobId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.jobId);
                if (message.serviceName != null && Object.hasOwnProperty.call(message, "serviceName"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.serviceName);
                if (message.processedCount != null && Object.hasOwnProperty.call(message, "processedCount"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.processedCount);
                if (message.totalRows != null && Object.hasOwnProperty.call(message, "totalRows"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.totalRows);
                return writer;
            };

            /**
             * Encodes the specified ProgressUpdate message, length delimited. Does not implicitly {@link cfk_poc.pipeline.ProgressUpdate.verify|verify} messages.
             * @function encodeDelimited
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @static
             * @param {cfk_poc.pipeline.IProgressUpdate} message ProgressUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProgressUpdate.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ProgressUpdate message from the specified reader or buffer.
             * @function decode
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {cfk_poc.pipeline.ProgressUpdate} ProgressUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProgressUpdate.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cfk_poc.pipeline.ProgressUpdate();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.jobId = reader.string();
                            break;
                        }
                    case 2: {
                            message.serviceName = reader.string();
                            break;
                        }
                    case 3: {
                            message.processedCount = reader.int32();
                            break;
                        }
                    case 4: {
                            message.totalRows = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ProgressUpdate message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {cfk_poc.pipeline.ProgressUpdate} ProgressUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProgressUpdate.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ProgressUpdate message.
             * @function verify
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ProgressUpdate.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.jobId != null && message.hasOwnProperty("jobId"))
                    if (!$util.isString(message.jobId))
                        return "jobId: string expected";
                if (message.serviceName != null && message.hasOwnProperty("serviceName"))
                    if (!$util.isString(message.serviceName))
                        return "serviceName: string expected";
                if (message.processedCount != null && message.hasOwnProperty("processedCount"))
                    if (!$util.isInteger(message.processedCount))
                        return "processedCount: integer expected";
                if (message.totalRows != null && message.hasOwnProperty("totalRows"))
                    if (!$util.isInteger(message.totalRows))
                        return "totalRows: integer expected";
                return null;
            };

            /**
             * Creates a ProgressUpdate message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {cfk_poc.pipeline.ProgressUpdate} ProgressUpdate
             */
            ProgressUpdate.fromObject = function fromObject(object) {
                if (object instanceof $root.cfk_poc.pipeline.ProgressUpdate)
                    return object;
                var message = new $root.cfk_poc.pipeline.ProgressUpdate();
                if (object.jobId != null)
                    message.jobId = String(object.jobId);
                if (object.serviceName != null)
                    message.serviceName = String(object.serviceName);
                if (object.processedCount != null)
                    message.processedCount = object.processedCount | 0;
                if (object.totalRows != null)
                    message.totalRows = object.totalRows | 0;
                return message;
            };

            /**
             * Creates a plain object from a ProgressUpdate message. Also converts values to other types if specified.
             * @function toObject
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @static
             * @param {cfk_poc.pipeline.ProgressUpdate} message ProgressUpdate
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ProgressUpdate.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.jobId = "";
                    object.serviceName = "";
                    object.processedCount = 0;
                    object.totalRows = 0;
                }
                if (message.jobId != null && message.hasOwnProperty("jobId"))
                    object.jobId = message.jobId;
                if (message.serviceName != null && message.hasOwnProperty("serviceName"))
                    object.serviceName = message.serviceName;
                if (message.processedCount != null && message.hasOwnProperty("processedCount"))
                    object.processedCount = message.processedCount;
                if (message.totalRows != null && message.hasOwnProperty("totalRows"))
                    object.totalRows = message.totalRows;
                return object;
            };

            /**
             * Converts this ProgressUpdate to JSON.
             * @function toJSON
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ProgressUpdate.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ProgressUpdate
             * @function getTypeUrl
             * @memberof cfk_poc.pipeline.ProgressUpdate
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ProgressUpdate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/cfk_poc.pipeline.ProgressUpdate";
            };

            return ProgressUpdate;
        })();

        pipeline.ValidationError = (function() {

            /**
             * Properties of a ValidationError.
             * @memberof cfk_poc.pipeline
             * @interface IValidationError
             * @property {string|null} [fieldName] ValidationError fieldName
             * @property {string|null} [errorCode] ValidationError errorCode
             * @property {string|null} [errorMessage] ValidationError errorMessage
             * @property {string|null} [expectedFormat] ValidationError expectedFormat
             * @property {string|null} [actualValue] ValidationError actualValue
             * @property {string|null} [validationRule] ValidationError validationRule
             */

            /**
             * Constructs a new ValidationError.
             * @memberof cfk_poc.pipeline
             * @classdesc Represents a ValidationError.
             * @implements IValidationError
             * @constructor
             * @param {cfk_poc.pipeline.IValidationError=} [properties] Properties to set
             */
            function ValidationError(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ValidationError fieldName.
             * @member {string} fieldName
             * @memberof cfk_poc.pipeline.ValidationError
             * @instance
             */
            ValidationError.prototype.fieldName = "";

            /**
             * ValidationError errorCode.
             * @member {string} errorCode
             * @memberof cfk_poc.pipeline.ValidationError
             * @instance
             */
            ValidationError.prototype.errorCode = "";

            /**
             * ValidationError errorMessage.
             * @member {string} errorMessage
             * @memberof cfk_poc.pipeline.ValidationError
             * @instance
             */
            ValidationError.prototype.errorMessage = "";

            /**
             * ValidationError expectedFormat.
             * @member {string} expectedFormat
             * @memberof cfk_poc.pipeline.ValidationError
             * @instance
             */
            ValidationError.prototype.expectedFormat = "";

            /**
             * ValidationError actualValue.
             * @member {string} actualValue
             * @memberof cfk_poc.pipeline.ValidationError
             * @instance
             */
            ValidationError.prototype.actualValue = "";

            /**
             * ValidationError validationRule.
             * @member {string} validationRule
             * @memberof cfk_poc.pipeline.ValidationError
             * @instance
             */
            ValidationError.prototype.validationRule = "";

            /**
             * Creates a new ValidationError instance using the specified properties.
             * @function create
             * @memberof cfk_poc.pipeline.ValidationError
             * @static
             * @param {cfk_poc.pipeline.IValidationError=} [properties] Properties to set
             * @returns {cfk_poc.pipeline.ValidationError} ValidationError instance
             */
            ValidationError.create = function create(properties) {
                return new ValidationError(properties);
            };

            /**
             * Encodes the specified ValidationError message. Does not implicitly {@link cfk_poc.pipeline.ValidationError.verify|verify} messages.
             * @function encode
             * @memberof cfk_poc.pipeline.ValidationError
             * @static
             * @param {cfk_poc.pipeline.IValidationError} message ValidationError message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ValidationError.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.fieldName != null && Object.hasOwnProperty.call(message, "fieldName"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.fieldName);
                if (message.errorCode != null && Object.hasOwnProperty.call(message, "errorCode"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.errorCode);
                if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.errorMessage);
                if (message.expectedFormat != null && Object.hasOwnProperty.call(message, "expectedFormat"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.expectedFormat);
                if (message.actualValue != null && Object.hasOwnProperty.call(message, "actualValue"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.actualValue);
                if (message.validationRule != null && Object.hasOwnProperty.call(message, "validationRule"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.validationRule);
                return writer;
            };

            /**
             * Encodes the specified ValidationError message, length delimited. Does not implicitly {@link cfk_poc.pipeline.ValidationError.verify|verify} messages.
             * @function encodeDelimited
             * @memberof cfk_poc.pipeline.ValidationError
             * @static
             * @param {cfk_poc.pipeline.IValidationError} message ValidationError message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ValidationError.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ValidationError message from the specified reader or buffer.
             * @function decode
             * @memberof cfk_poc.pipeline.ValidationError
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {cfk_poc.pipeline.ValidationError} ValidationError
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ValidationError.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cfk_poc.pipeline.ValidationError();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.fieldName = reader.string();
                            break;
                        }
                    case 2: {
                            message.errorCode = reader.string();
                            break;
                        }
                    case 3: {
                            message.errorMessage = reader.string();
                            break;
                        }
                    case 4: {
                            message.expectedFormat = reader.string();
                            break;
                        }
                    case 5: {
                            message.actualValue = reader.string();
                            break;
                        }
                    case 6: {
                            message.validationRule = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ValidationError message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof cfk_poc.pipeline.ValidationError
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {cfk_poc.pipeline.ValidationError} ValidationError
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ValidationError.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ValidationError message.
             * @function verify
             * @memberof cfk_poc.pipeline.ValidationError
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ValidationError.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.fieldName != null && message.hasOwnProperty("fieldName"))
                    if (!$util.isString(message.fieldName))
                        return "fieldName: string expected";
                if (message.errorCode != null && message.hasOwnProperty("errorCode"))
                    if (!$util.isString(message.errorCode))
                        return "errorCode: string expected";
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    if (!$util.isString(message.errorMessage))
                        return "errorMessage: string expected";
                if (message.expectedFormat != null && message.hasOwnProperty("expectedFormat"))
                    if (!$util.isString(message.expectedFormat))
                        return "expectedFormat: string expected";
                if (message.actualValue != null && message.hasOwnProperty("actualValue"))
                    if (!$util.isString(message.actualValue))
                        return "actualValue: string expected";
                if (message.validationRule != null && message.hasOwnProperty("validationRule"))
                    if (!$util.isString(message.validationRule))
                        return "validationRule: string expected";
                return null;
            };

            /**
             * Creates a ValidationError message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof cfk_poc.pipeline.ValidationError
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {cfk_poc.pipeline.ValidationError} ValidationError
             */
            ValidationError.fromObject = function fromObject(object) {
                if (object instanceof $root.cfk_poc.pipeline.ValidationError)
                    return object;
                var message = new $root.cfk_poc.pipeline.ValidationError();
                if (object.fieldName != null)
                    message.fieldName = String(object.fieldName);
                if (object.errorCode != null)
                    message.errorCode = String(object.errorCode);
                if (object.errorMessage != null)
                    message.errorMessage = String(object.errorMessage);
                if (object.expectedFormat != null)
                    message.expectedFormat = String(object.expectedFormat);
                if (object.actualValue != null)
                    message.actualValue = String(object.actualValue);
                if (object.validationRule != null)
                    message.validationRule = String(object.validationRule);
                return message;
            };

            /**
             * Creates a plain object from a ValidationError message. Also converts values to other types if specified.
             * @function toObject
             * @memberof cfk_poc.pipeline.ValidationError
             * @static
             * @param {cfk_poc.pipeline.ValidationError} message ValidationError
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ValidationError.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.fieldName = "";
                    object.errorCode = "";
                    object.errorMessage = "";
                    object.expectedFormat = "";
                    object.actualValue = "";
                    object.validationRule = "";
                }
                if (message.fieldName != null && message.hasOwnProperty("fieldName"))
                    object.fieldName = message.fieldName;
                if (message.errorCode != null && message.hasOwnProperty("errorCode"))
                    object.errorCode = message.errorCode;
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    object.errorMessage = message.errorMessage;
                if (message.expectedFormat != null && message.hasOwnProperty("expectedFormat"))
                    object.expectedFormat = message.expectedFormat;
                if (message.actualValue != null && message.hasOwnProperty("actualValue"))
                    object.actualValue = message.actualValue;
                if (message.validationRule != null && message.hasOwnProperty("validationRule"))
                    object.validationRule = message.validationRule;
                return object;
            };

            /**
             * Converts this ValidationError to JSON.
             * @function toJSON
             * @memberof cfk_poc.pipeline.ValidationError
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ValidationError.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ValidationError
             * @function getTypeUrl
             * @memberof cfk_poc.pipeline.ValidationError
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ValidationError.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/cfk_poc.pipeline.ValidationError";
            };

            return ValidationError;
        })();

        pipeline.ValidRowMessage = (function() {

            /**
             * Properties of a ValidRowMessage.
             * @memberof cfk_poc.pipeline
             * @interface IValidRowMessage
             * @property {string|null} [jobId] ValidRowMessage jobId
             * @property {string|null} [orgId] ValidRowMessage orgId
             * @property {string|null} [sourceId] ValidRowMessage sourceId
             * @property {cfk_poc.pipeline.IDataRow|null} [validRow] ValidRowMessage validRow
             */

            /**
             * Constructs a new ValidRowMessage.
             * @memberof cfk_poc.pipeline
             * @classdesc Represents a ValidRowMessage.
             * @implements IValidRowMessage
             * @constructor
             * @param {cfk_poc.pipeline.IValidRowMessage=} [properties] Properties to set
             */
            function ValidRowMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ValidRowMessage jobId.
             * @member {string} jobId
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @instance
             */
            ValidRowMessage.prototype.jobId = "";

            /**
             * ValidRowMessage orgId.
             * @member {string} orgId
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @instance
             */
            ValidRowMessage.prototype.orgId = "";

            /**
             * ValidRowMessage sourceId.
             * @member {string} sourceId
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @instance
             */
            ValidRowMessage.prototype.sourceId = "";

            /**
             * ValidRowMessage validRow.
             * @member {cfk_poc.pipeline.IDataRow|null|undefined} validRow
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @instance
             */
            ValidRowMessage.prototype.validRow = null;

            /**
             * Creates a new ValidRowMessage instance using the specified properties.
             * @function create
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @static
             * @param {cfk_poc.pipeline.IValidRowMessage=} [properties] Properties to set
             * @returns {cfk_poc.pipeline.ValidRowMessage} ValidRowMessage instance
             */
            ValidRowMessage.create = function create(properties) {
                return new ValidRowMessage(properties);
            };

            /**
             * Encodes the specified ValidRowMessage message. Does not implicitly {@link cfk_poc.pipeline.ValidRowMessage.verify|verify} messages.
             * @function encode
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @static
             * @param {cfk_poc.pipeline.IValidRowMessage} message ValidRowMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ValidRowMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.jobId != null && Object.hasOwnProperty.call(message, "jobId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.jobId);
                if (message.orgId != null && Object.hasOwnProperty.call(message, "orgId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.orgId);
                if (message.sourceId != null && Object.hasOwnProperty.call(message, "sourceId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.sourceId);
                if (message.validRow != null && Object.hasOwnProperty.call(message, "validRow"))
                    $root.cfk_poc.pipeline.DataRow.encode(message.validRow, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ValidRowMessage message, length delimited. Does not implicitly {@link cfk_poc.pipeline.ValidRowMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @static
             * @param {cfk_poc.pipeline.IValidRowMessage} message ValidRowMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ValidRowMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ValidRowMessage message from the specified reader or buffer.
             * @function decode
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {cfk_poc.pipeline.ValidRowMessage} ValidRowMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ValidRowMessage.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cfk_poc.pipeline.ValidRowMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.jobId = reader.string();
                            break;
                        }
                    case 2: {
                            message.orgId = reader.string();
                            break;
                        }
                    case 3: {
                            message.sourceId = reader.string();
                            break;
                        }
                    case 4: {
                            message.validRow = $root.cfk_poc.pipeline.DataRow.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ValidRowMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {cfk_poc.pipeline.ValidRowMessage} ValidRowMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ValidRowMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ValidRowMessage message.
             * @function verify
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ValidRowMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.jobId != null && message.hasOwnProperty("jobId"))
                    if (!$util.isString(message.jobId))
                        return "jobId: string expected";
                if (message.orgId != null && message.hasOwnProperty("orgId"))
                    if (!$util.isString(message.orgId))
                        return "orgId: string expected";
                if (message.sourceId != null && message.hasOwnProperty("sourceId"))
                    if (!$util.isString(message.sourceId))
                        return "sourceId: string expected";
                if (message.validRow != null && message.hasOwnProperty("validRow")) {
                    var error = $root.cfk_poc.pipeline.DataRow.verify(message.validRow);
                    if (error)
                        return "validRow." + error;
                }
                return null;
            };

            /**
             * Creates a ValidRowMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {cfk_poc.pipeline.ValidRowMessage} ValidRowMessage
             */
            ValidRowMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.cfk_poc.pipeline.ValidRowMessage)
                    return object;
                var message = new $root.cfk_poc.pipeline.ValidRowMessage();
                if (object.jobId != null)
                    message.jobId = String(object.jobId);
                if (object.orgId != null)
                    message.orgId = String(object.orgId);
                if (object.sourceId != null)
                    message.sourceId = String(object.sourceId);
                if (object.validRow != null) {
                    if (typeof object.validRow !== "object")
                        throw TypeError(".cfk_poc.pipeline.ValidRowMessage.validRow: object expected");
                    message.validRow = $root.cfk_poc.pipeline.DataRow.fromObject(object.validRow);
                }
                return message;
            };

            /**
             * Creates a plain object from a ValidRowMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @static
             * @param {cfk_poc.pipeline.ValidRowMessage} message ValidRowMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ValidRowMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.jobId = "";
                    object.orgId = "";
                    object.sourceId = "";
                    object.validRow = null;
                }
                if (message.jobId != null && message.hasOwnProperty("jobId"))
                    object.jobId = message.jobId;
                if (message.orgId != null && message.hasOwnProperty("orgId"))
                    object.orgId = message.orgId;
                if (message.sourceId != null && message.hasOwnProperty("sourceId"))
                    object.sourceId = message.sourceId;
                if (message.validRow != null && message.hasOwnProperty("validRow"))
                    object.validRow = $root.cfk_poc.pipeline.DataRow.toObject(message.validRow, options);
                return object;
            };

            /**
             * Converts this ValidRowMessage to JSON.
             * @function toJSON
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ValidRowMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ValidRowMessage
             * @function getTypeUrl
             * @memberof cfk_poc.pipeline.ValidRowMessage
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ValidRowMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/cfk_poc.pipeline.ValidRowMessage";
            };

            return ValidRowMessage;
        })();

        pipeline.InvalidRowMessage = (function() {

            /**
             * Properties of an InvalidRowMessage.
             * @memberof cfk_poc.pipeline
             * @interface IInvalidRowMessage
             * @property {string|null} [jobId] InvalidRowMessage jobId
             * @property {string|null} [orgId] InvalidRowMessage orgId
             * @property {string|null} [sourceId] InvalidRowMessage sourceId
             * @property {cfk_poc.pipeline.IDataRow|null} [originalRow] InvalidRowMessage originalRow
             * @property {Array.<cfk_poc.pipeline.IValidationError>|null} [errors] InvalidRowMessage errors
             */

            /**
             * Constructs a new InvalidRowMessage.
             * @memberof cfk_poc.pipeline
             * @classdesc Represents an InvalidRowMessage.
             * @implements IInvalidRowMessage
             * @constructor
             * @param {cfk_poc.pipeline.IInvalidRowMessage=} [properties] Properties to set
             */
            function InvalidRowMessage(properties) {
                this.errors = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * InvalidRowMessage jobId.
             * @member {string} jobId
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @instance
             */
            InvalidRowMessage.prototype.jobId = "";

            /**
             * InvalidRowMessage orgId.
             * @member {string} orgId
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @instance
             */
            InvalidRowMessage.prototype.orgId = "";

            /**
             * InvalidRowMessage sourceId.
             * @member {string} sourceId
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @instance
             */
            InvalidRowMessage.prototype.sourceId = "";

            /**
             * InvalidRowMessage originalRow.
             * @member {cfk_poc.pipeline.IDataRow|null|undefined} originalRow
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @instance
             */
            InvalidRowMessage.prototype.originalRow = null;

            /**
             * InvalidRowMessage errors.
             * @member {Array.<cfk_poc.pipeline.IValidationError>} errors
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @instance
             */
            InvalidRowMessage.prototype.errors = $util.emptyArray;

            /**
             * Creates a new InvalidRowMessage instance using the specified properties.
             * @function create
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @static
             * @param {cfk_poc.pipeline.IInvalidRowMessage=} [properties] Properties to set
             * @returns {cfk_poc.pipeline.InvalidRowMessage} InvalidRowMessage instance
             */
            InvalidRowMessage.create = function create(properties) {
                return new InvalidRowMessage(properties);
            };

            /**
             * Encodes the specified InvalidRowMessage message. Does not implicitly {@link cfk_poc.pipeline.InvalidRowMessage.verify|verify} messages.
             * @function encode
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @static
             * @param {cfk_poc.pipeline.IInvalidRowMessage} message InvalidRowMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InvalidRowMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.jobId != null && Object.hasOwnProperty.call(message, "jobId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.jobId);
                if (message.orgId != null && Object.hasOwnProperty.call(message, "orgId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.orgId);
                if (message.sourceId != null && Object.hasOwnProperty.call(message, "sourceId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.sourceId);
                if (message.originalRow != null && Object.hasOwnProperty.call(message, "originalRow"))
                    $root.cfk_poc.pipeline.DataRow.encode(message.originalRow, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.errors != null && message.errors.length)
                    for (var i = 0; i < message.errors.length; ++i)
                        $root.cfk_poc.pipeline.ValidationError.encode(message.errors[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified InvalidRowMessage message, length delimited. Does not implicitly {@link cfk_poc.pipeline.InvalidRowMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @static
             * @param {cfk_poc.pipeline.IInvalidRowMessage} message InvalidRowMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InvalidRowMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an InvalidRowMessage message from the specified reader or buffer.
             * @function decode
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {cfk_poc.pipeline.InvalidRowMessage} InvalidRowMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InvalidRowMessage.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cfk_poc.pipeline.InvalidRowMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.jobId = reader.string();
                            break;
                        }
                    case 2: {
                            message.orgId = reader.string();
                            break;
                        }
                    case 3: {
                            message.sourceId = reader.string();
                            break;
                        }
                    case 4: {
                            message.originalRow = $root.cfk_poc.pipeline.DataRow.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            if (!(message.errors && message.errors.length))
                                message.errors = [];
                            message.errors.push($root.cfk_poc.pipeline.ValidationError.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an InvalidRowMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {cfk_poc.pipeline.InvalidRowMessage} InvalidRowMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InvalidRowMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an InvalidRowMessage message.
             * @function verify
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            InvalidRowMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.jobId != null && message.hasOwnProperty("jobId"))
                    if (!$util.isString(message.jobId))
                        return "jobId: string expected";
                if (message.orgId != null && message.hasOwnProperty("orgId"))
                    if (!$util.isString(message.orgId))
                        return "orgId: string expected";
                if (message.sourceId != null && message.hasOwnProperty("sourceId"))
                    if (!$util.isString(message.sourceId))
                        return "sourceId: string expected";
                if (message.originalRow != null && message.hasOwnProperty("originalRow")) {
                    var error = $root.cfk_poc.pipeline.DataRow.verify(message.originalRow);
                    if (error)
                        return "originalRow." + error;
                }
                if (message.errors != null && message.hasOwnProperty("errors")) {
                    if (!Array.isArray(message.errors))
                        return "errors: array expected";
                    for (var i = 0; i < message.errors.length; ++i) {
                        var error = $root.cfk_poc.pipeline.ValidationError.verify(message.errors[i]);
                        if (error)
                            return "errors." + error;
                    }
                }
                return null;
            };

            /**
             * Creates an InvalidRowMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {cfk_poc.pipeline.InvalidRowMessage} InvalidRowMessage
             */
            InvalidRowMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.cfk_poc.pipeline.InvalidRowMessage)
                    return object;
                var message = new $root.cfk_poc.pipeline.InvalidRowMessage();
                if (object.jobId != null)
                    message.jobId = String(object.jobId);
                if (object.orgId != null)
                    message.orgId = String(object.orgId);
                if (object.sourceId != null)
                    message.sourceId = String(object.sourceId);
                if (object.originalRow != null) {
                    if (typeof object.originalRow !== "object")
                        throw TypeError(".cfk_poc.pipeline.InvalidRowMessage.originalRow: object expected");
                    message.originalRow = $root.cfk_poc.pipeline.DataRow.fromObject(object.originalRow);
                }
                if (object.errors) {
                    if (!Array.isArray(object.errors))
                        throw TypeError(".cfk_poc.pipeline.InvalidRowMessage.errors: array expected");
                    message.errors = [];
                    for (var i = 0; i < object.errors.length; ++i) {
                        if (typeof object.errors[i] !== "object")
                            throw TypeError(".cfk_poc.pipeline.InvalidRowMessage.errors: object expected");
                        message.errors[i] = $root.cfk_poc.pipeline.ValidationError.fromObject(object.errors[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from an InvalidRowMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @static
             * @param {cfk_poc.pipeline.InvalidRowMessage} message InvalidRowMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            InvalidRowMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.errors = [];
                if (options.defaults) {
                    object.jobId = "";
                    object.orgId = "";
                    object.sourceId = "";
                    object.originalRow = null;
                }
                if (message.jobId != null && message.hasOwnProperty("jobId"))
                    object.jobId = message.jobId;
                if (message.orgId != null && message.hasOwnProperty("orgId"))
                    object.orgId = message.orgId;
                if (message.sourceId != null && message.hasOwnProperty("sourceId"))
                    object.sourceId = message.sourceId;
                if (message.originalRow != null && message.hasOwnProperty("originalRow"))
                    object.originalRow = $root.cfk_poc.pipeline.DataRow.toObject(message.originalRow, options);
                if (message.errors && message.errors.length) {
                    object.errors = [];
                    for (var j = 0; j < message.errors.length; ++j)
                        object.errors[j] = $root.cfk_poc.pipeline.ValidationError.toObject(message.errors[j], options);
                }
                return object;
            };

            /**
             * Converts this InvalidRowMessage to JSON.
             * @function toJSON
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            InvalidRowMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for InvalidRowMessage
             * @function getTypeUrl
             * @memberof cfk_poc.pipeline.InvalidRowMessage
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            InvalidRowMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/cfk_poc.pipeline.InvalidRowMessage";
            };

            return InvalidRowMessage;
        })();

        return pipeline;
    })();

    return cfk_poc;
})();

module.exports = $root;
