import { logError } from './logger';
import * as generated from './generated.js';

/**
 * Serialize valid row message to protobuf format
 */
export const serializeValidRowMessage = (message: any) => {
    try {
        const protobufMessage = generated.cfk_poc.pipeline.ValidRowMessage.create({
            jobId: message.jobId,
            orgId: message.orgId,
            sourceId: message.sourceId,
            data: {
                rowNumber: message.data.rowNumber,
                fields: message.data.fields,
                rawData: message.data.rawData
            },
            dataId: message.dataId,
            timestamp: message.timestamp
        });

        const writer = generated.cfk_poc.pipeline.ValidRowMessage.encode(protobufMessage);
        const buffer = Buffer.from(writer.finish());

        return {
            success: true,
            data: buffer
        };
    } catch (error) {
        logError('Failed to serialize valid row message', error, {
            jobId: message.jobId,
            dataId: message.dataId
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Serialize multiple valid row messages
 */
export const serializeValidRowMessages = (messages: any[]) => {
    const serializedMessages: Buffer[] = [];
    const errors: string[] = [];

    for (const message of messages) {
        const result = serializeValidRowMessage(message);
        if (result.success && result.data) {
            serializedMessages.push(result.data);
        } else {
            errors.push(`Failed to serialize message: ${result.error}`);
        }
    }

    return {
        success: errors.length === 0,
        serializedMessages,
        errors
    };
};
