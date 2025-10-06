import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace cfk_poc. */
export namespace cfk_poc {

    /** Namespace pipeline. */
    namespace pipeline {

        /** Properties of a DataRow. */
        interface IDataRow {

            /** DataRow rowNumber */
            rowNumber?: (number|null);

            /** DataRow fields */
            fields?: ({ [k: string]: string }|null);

            /** DataRow rawData */
            rawData?: (string|null);
        }

        /** Represents a DataRow. */
        class DataRow implements IDataRow {

            /**
             * Constructs a new DataRow.
             * @param [properties] Properties to set
             */
            constructor(properties?: cfk_poc.pipeline.IDataRow);

            /** DataRow rowNumber. */
            public rowNumber: number;

            /** DataRow fields. */
            public fields: { [k: string]: string };

            /** DataRow rawData. */
            public rawData: string;

            /**
             * Creates a new DataRow instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DataRow instance
             */
            public static create(properties?: cfk_poc.pipeline.IDataRow): cfk_poc.pipeline.DataRow;

            /**
             * Encodes the specified DataRow message. Does not implicitly {@link cfk_poc.pipeline.DataRow.verify|verify} messages.
             * @param message DataRow message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: cfk_poc.pipeline.IDataRow, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DataRow message, length delimited. Does not implicitly {@link cfk_poc.pipeline.DataRow.verify|verify} messages.
             * @param message DataRow message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: cfk_poc.pipeline.IDataRow, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DataRow message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DataRow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cfk_poc.pipeline.DataRow;

            /**
             * Decodes a DataRow message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DataRow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cfk_poc.pipeline.DataRow;

            /**
             * Verifies a DataRow message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DataRow message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DataRow
             */
            public static fromObject(object: { [k: string]: any }): cfk_poc.pipeline.DataRow;

            /**
             * Creates a plain object from a DataRow message. Also converts values to other types if specified.
             * @param message DataRow
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: cfk_poc.pipeline.DataRow, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DataRow to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DataRow
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DataChunk. */
        interface IDataChunk {

            /** DataChunk jobId */
            jobId?: (string|null);

            /** DataChunk orgId */
            orgId?: (string|null);

            /** DataChunk sourceId */
            sourceId?: (string|null);

            /** DataChunk chunkNumber */
            chunkNumber?: (number|null);

            /** DataChunk rows */
            rows?: (cfk_poc.pipeline.IDataRow[]|null);
        }

        /** Represents a DataChunk. */
        class DataChunk implements IDataChunk {

            /**
             * Constructs a new DataChunk.
             * @param [properties] Properties to set
             */
            constructor(properties?: cfk_poc.pipeline.IDataChunk);

            /** DataChunk jobId. */
            public jobId: string;

            /** DataChunk orgId. */
            public orgId: string;

            /** DataChunk sourceId. */
            public sourceId: string;

            /** DataChunk chunkNumber. */
            public chunkNumber: number;

            /** DataChunk rows. */
            public rows: cfk_poc.pipeline.IDataRow[];

            /**
             * Creates a new DataChunk instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DataChunk instance
             */
            public static create(properties?: cfk_poc.pipeline.IDataChunk): cfk_poc.pipeline.DataChunk;

            /**
             * Encodes the specified DataChunk message. Does not implicitly {@link cfk_poc.pipeline.DataChunk.verify|verify} messages.
             * @param message DataChunk message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: cfk_poc.pipeline.IDataChunk, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DataChunk message, length delimited. Does not implicitly {@link cfk_poc.pipeline.DataChunk.verify|verify} messages.
             * @param message DataChunk message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: cfk_poc.pipeline.IDataChunk, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DataChunk message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DataChunk
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cfk_poc.pipeline.DataChunk;

            /**
             * Decodes a DataChunk message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DataChunk
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cfk_poc.pipeline.DataChunk;

            /**
             * Verifies a DataChunk message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DataChunk message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DataChunk
             */
            public static fromObject(object: { [k: string]: any }): cfk_poc.pipeline.DataChunk;

            /**
             * Creates a plain object from a DataChunk message. Also converts values to other types if specified.
             * @param message DataChunk
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: cfk_poc.pipeline.DataChunk, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DataChunk to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DataChunk
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ProgressUpdate. */
        interface IProgressUpdate {

            /** ProgressUpdate jobId */
            jobId?: (string|null);

            /** ProgressUpdate serviceName */
            serviceName?: (string|null);

            /** ProgressUpdate processedCount */
            processedCount?: (number|null);

            /** ProgressUpdate totalRows */
            totalRows?: (number|null);
        }

        /** Represents a ProgressUpdate. */
        class ProgressUpdate implements IProgressUpdate {

            /**
             * Constructs a new ProgressUpdate.
             * @param [properties] Properties to set
             */
            constructor(properties?: cfk_poc.pipeline.IProgressUpdate);

            /** ProgressUpdate jobId. */
            public jobId: string;

            /** ProgressUpdate serviceName. */
            public serviceName: string;

            /** ProgressUpdate processedCount. */
            public processedCount: number;

            /** ProgressUpdate totalRows. */
            public totalRows: number;

            /**
             * Creates a new ProgressUpdate instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ProgressUpdate instance
             */
            public static create(properties?: cfk_poc.pipeline.IProgressUpdate): cfk_poc.pipeline.ProgressUpdate;

            /**
             * Encodes the specified ProgressUpdate message. Does not implicitly {@link cfk_poc.pipeline.ProgressUpdate.verify|verify} messages.
             * @param message ProgressUpdate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: cfk_poc.pipeline.IProgressUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ProgressUpdate message, length delimited. Does not implicitly {@link cfk_poc.pipeline.ProgressUpdate.verify|verify} messages.
             * @param message ProgressUpdate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: cfk_poc.pipeline.IProgressUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ProgressUpdate message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ProgressUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cfk_poc.pipeline.ProgressUpdate;

            /**
             * Decodes a ProgressUpdate message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ProgressUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cfk_poc.pipeline.ProgressUpdate;

            /**
             * Verifies a ProgressUpdate message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ProgressUpdate message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ProgressUpdate
             */
            public static fromObject(object: { [k: string]: any }): cfk_poc.pipeline.ProgressUpdate;

            /**
             * Creates a plain object from a ProgressUpdate message. Also converts values to other types if specified.
             * @param message ProgressUpdate
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: cfk_poc.pipeline.ProgressUpdate, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ProgressUpdate to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ProgressUpdate
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ValidationError. */
        interface IValidationError {

            /** ValidationError fieldName */
            fieldName?: (string|null);

            /** ValidationError errorCode */
            errorCode?: (string|null);

            /** ValidationError errorMessage */
            errorMessage?: (string|null);

            /** ValidationError expectedFormat */
            expectedFormat?: (string|null);

            /** ValidationError actualValue */
            actualValue?: (string|null);

            /** ValidationError validationRule */
            validationRule?: (string|null);
        }

        /** Represents a ValidationError. */
        class ValidationError implements IValidationError {

            /**
             * Constructs a new ValidationError.
             * @param [properties] Properties to set
             */
            constructor(properties?: cfk_poc.pipeline.IValidationError);

            /** ValidationError fieldName. */
            public fieldName: string;

            /** ValidationError errorCode. */
            public errorCode: string;

            /** ValidationError errorMessage. */
            public errorMessage: string;

            /** ValidationError expectedFormat. */
            public expectedFormat: string;

            /** ValidationError actualValue. */
            public actualValue: string;

            /** ValidationError validationRule. */
            public validationRule: string;

            /**
             * Creates a new ValidationError instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ValidationError instance
             */
            public static create(properties?: cfk_poc.pipeline.IValidationError): cfk_poc.pipeline.ValidationError;

            /**
             * Encodes the specified ValidationError message. Does not implicitly {@link cfk_poc.pipeline.ValidationError.verify|verify} messages.
             * @param message ValidationError message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: cfk_poc.pipeline.IValidationError, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ValidationError message, length delimited. Does not implicitly {@link cfk_poc.pipeline.ValidationError.verify|verify} messages.
             * @param message ValidationError message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: cfk_poc.pipeline.IValidationError, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ValidationError message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ValidationError
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cfk_poc.pipeline.ValidationError;

            /**
             * Decodes a ValidationError message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ValidationError
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cfk_poc.pipeline.ValidationError;

            /**
             * Verifies a ValidationError message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ValidationError message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ValidationError
             */
            public static fromObject(object: { [k: string]: any }): cfk_poc.pipeline.ValidationError;

            /**
             * Creates a plain object from a ValidationError message. Also converts values to other types if specified.
             * @param message ValidationError
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: cfk_poc.pipeline.ValidationError, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ValidationError to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ValidationError
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ValidRowMessage. */
        interface IValidRowMessage {

            /** ValidRowMessage jobId */
            jobId?: (string|null);

            /** ValidRowMessage orgId */
            orgId?: (string|null);

            /** ValidRowMessage sourceId */
            sourceId?: (string|null);

            /** ValidRowMessage data */
            data?: (cfk_poc.pipeline.IDataRow|null);

            /** ValidRowMessage dataId */
            dataId?: (string|null);
        }

        /** Represents a ValidRowMessage. */
        class ValidRowMessage implements IValidRowMessage {

            /**
             * Constructs a new ValidRowMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: cfk_poc.pipeline.IValidRowMessage);

            /** ValidRowMessage jobId. */
            public jobId: string;

            /** ValidRowMessage orgId. */
            public orgId: string;

            /** ValidRowMessage sourceId. */
            public sourceId: string;

            /** ValidRowMessage data. */
            public data?: (cfk_poc.pipeline.IDataRow|null);

            /** ValidRowMessage dataId. */
            public dataId: string;

            /**
             * Creates a new ValidRowMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ValidRowMessage instance
             */
            public static create(properties?: cfk_poc.pipeline.IValidRowMessage): cfk_poc.pipeline.ValidRowMessage;

            /**
             * Encodes the specified ValidRowMessage message. Does not implicitly {@link cfk_poc.pipeline.ValidRowMessage.verify|verify} messages.
             * @param message ValidRowMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: cfk_poc.pipeline.IValidRowMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ValidRowMessage message, length delimited. Does not implicitly {@link cfk_poc.pipeline.ValidRowMessage.verify|verify} messages.
             * @param message ValidRowMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: cfk_poc.pipeline.IValidRowMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ValidRowMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ValidRowMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cfk_poc.pipeline.ValidRowMessage;

            /**
             * Decodes a ValidRowMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ValidRowMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cfk_poc.pipeline.ValidRowMessage;

            /**
             * Verifies a ValidRowMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ValidRowMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ValidRowMessage
             */
            public static fromObject(object: { [k: string]: any }): cfk_poc.pipeline.ValidRowMessage;

            /**
             * Creates a plain object from a ValidRowMessage message. Also converts values to other types if specified.
             * @param message ValidRowMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: cfk_poc.pipeline.ValidRowMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ValidRowMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ValidRowMessage
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an InvalidRowMessage. */
        interface IInvalidRowMessage {

            /** InvalidRowMessage jobId */
            jobId?: (string|null);

            /** InvalidRowMessage orgId */
            orgId?: (string|null);

            /** InvalidRowMessage sourceId */
            sourceId?: (string|null);

            /** InvalidRowMessage originalRow */
            originalRow?: (cfk_poc.pipeline.IDataRow|null);

            /** InvalidRowMessage errors */
            errors?: (cfk_poc.pipeline.IValidationError[]|null);
        }

        /** Represents an InvalidRowMessage. */
        class InvalidRowMessage implements IInvalidRowMessage {

            /**
             * Constructs a new InvalidRowMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: cfk_poc.pipeline.IInvalidRowMessage);

            /** InvalidRowMessage jobId. */
            public jobId: string;

            /** InvalidRowMessage orgId. */
            public orgId: string;

            /** InvalidRowMessage sourceId. */
            public sourceId: string;

            /** InvalidRowMessage originalRow. */
            public originalRow?: (cfk_poc.pipeline.IDataRow|null);

            /** InvalidRowMessage errors. */
            public errors: cfk_poc.pipeline.IValidationError[];

            /**
             * Creates a new InvalidRowMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns InvalidRowMessage instance
             */
            public static create(properties?: cfk_poc.pipeline.IInvalidRowMessage): cfk_poc.pipeline.InvalidRowMessage;

            /**
             * Encodes the specified InvalidRowMessage message. Does not implicitly {@link cfk_poc.pipeline.InvalidRowMessage.verify|verify} messages.
             * @param message InvalidRowMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: cfk_poc.pipeline.IInvalidRowMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified InvalidRowMessage message, length delimited. Does not implicitly {@link cfk_poc.pipeline.InvalidRowMessage.verify|verify} messages.
             * @param message InvalidRowMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: cfk_poc.pipeline.IInvalidRowMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an InvalidRowMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns InvalidRowMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cfk_poc.pipeline.InvalidRowMessage;

            /**
             * Decodes an InvalidRowMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns InvalidRowMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cfk_poc.pipeline.InvalidRowMessage;

            /**
             * Verifies an InvalidRowMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an InvalidRowMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns InvalidRowMessage
             */
            public static fromObject(object: { [k: string]: any }): cfk_poc.pipeline.InvalidRowMessage;

            /**
             * Creates a plain object from an InvalidRowMessage message. Also converts values to other types if specified.
             * @param message InvalidRowMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: cfk_poc.pipeline.InvalidRowMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this InvalidRowMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for InvalidRowMessage
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
