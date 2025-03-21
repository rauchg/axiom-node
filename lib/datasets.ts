import { AxiosResponse } from 'axios';
import { Readable, Stream } from 'stream';

import HTTPClient from './httpClient';
import { starred } from './starred';

export namespace datasets {
    export const TimestampField = '_time';

    export enum ContentType {
        JSON = 'application/json',
        NDJSON = 'application/x-ndjson',
        CSV = 'text/csv',
    }

    export enum ContentEncoding {
        Identity = '',
        GZIP = 'gzip',
    }

    export interface Dataset {
        id: number;
        name: string;
        description?: string;
        who?: string;
        created: string;
    }

    export interface Field {
        name: string;
        description: string;
        type: string;
        unit: string;
        hidden: boolean;
    }

    export interface Info {
        name: string;
        fields?: Array<Field>;
        compressedBytes: number;
        compressedBytesHuman: string;
        inputBytes: number;
        inputBytesHuman: string;
        numBlocks: number;
        numEvents: number;
        numFields: number;
        maxTime?: string;
        minTime?: string;
        created: string;
        who: string;
    }

    export interface Stats {
        datasets?: Array<Info>;
        numBlocks: number;
        numEvents: number;
        inputBytes: number;
        inputBytesHuman: string;
        compressedBytes: number;
        compressedBytesHuman: string;
    }

    export interface TrimResult {
        numDeleted: number;
    }

    export interface HistoryQuery {
        id: string;
        dataset: string;
        kind: starred.QueryKind;
        // query: QueryRequest; //FIXME(lukasmalkmus): Add QueryRequest type
        who: string;
        created: string;
    }

    export interface CreateRequest {
        name: string;
        description?: string;
    }

    export interface UpdateRequest {
        description: string;
    }

    export interface IngestOptions {
        timestampField?: string;
        timestampFormat?: string;
        csvDelimiter?: string;
    }

    export interface IngestStatus {
        ingested: number;
        failed: number;
        failures?: Array<IngestFailure>;
        processedBytes: number;
        blocksCreated: number;
        walLength: number;
    }

    export interface IngestFailure {
        timestamp: string;
        error: string;
    }

    export interface QueryOptions {
        streamingDuration: string;
        noCache: boolean;
    }

    export interface APLQueryOptions extends QueryOptions {
        startTime?: string;
        endTime?: string;
    }

    export interface Query {
        aggregations?: Array<Aggregation>;
        continuationToken?: string;
        cursor?: string;
        endTime: string;
        filter?: Filter;
        groupBy?: Array<string>;
        includeCursor?: boolean;
        limit?: number;
        order?: Array<Order>;
        project?: Array<Projection>;
        resolution: string;
        startTime: string;
        virtualFields?: Array<VirtualColumn>;
    }

    export interface Aggregation {
        argument?: any;
        field: string;
        op: AggregationOp;
    }

    export enum AggregationOp {
        Count = 'count',
        Distinct = 'distinct',
        Sum = 'sum',
        Avg = 'avg',
        Min = 'min',
        Max = 'max',
        Topk = 'topk',
        Percentiles = 'percentiles',
        Histogram = 'histogram',
    }

    export interface Filter {
        caseSensitive?: boolean;
        children?: Array<Filter>;
        field: string;
        op: FilterOp;
        value?: any;
    }

    export enum FilterOp {
        And = 'and',
        Or = 'or',
        Not = 'not',
        Eq = 'eq',
        NotEqual = '!=',
        Ne = 'ne',
        Exists = 'exists',
        NotExists = 'not-exists',
        GreaterThan = '>',
        GreaterThanOrEqualTo = '>=',
        LessThan = '<',
        LessThanOrEqualTo = '<=',
        Gt = 'gt',
        Gte = 'gte',
        Lt = 'lt',
        Lte = 'lte',
        StartsWith = 'starts-with',
        NotStartsWith = 'not-starts-with',
        EndsWith = 'ends-with',
        NotEndsWith = 'not-ends-with',
        Contains = 'contains',
        NotContains = 'not-contains',
        Regexp = 'regexp',
        NotRegexp = 'not-regexp',
    }

    export interface Order {
        desc: boolean;
        field: string;
    }

    export interface Projection {
        alias?: string;
        field: string;
    }

    export interface VirtualColumn {
        alias: string;
        expr: string;
    }

    export interface QueryResult {
        buckets: Timeseries;
        matches?: Array<Entry>;
        status: Status;
    }

    export interface Timeseries {
        series?: Array<Interval>;
        totals?: Array<EntryGroup>;
    }

    export interface Interval {
        endTime: string;
        groups?: Array<EntryGroup>;
        startTime: string;
    }

    export interface EntryGroup {
        aggregations?: Array<EntryGroupAgg>;
        group: { [key: string]: any };
        id: number;
    }

    export interface EntryGroupAgg {
        op: string;
        value: any;
    }

    export interface Entry {
        _rowId: string;
        _sysTime: string;
        _time: string;
        data: { [key: string]: any };
    }

    export interface Status {
        blocksExamined: number;
        continuationToken?: string;
        elapsedTime: number;
        isEstimate?: boolean;
        isPartial: boolean;
        maxBlockTime: string;
        messages?: Array<Message>;
        minBlockTime: string;
        numGroups: number;
        rowsExamined: number;
        rowsMatched: number;
    }

    export interface Message {
        code?: string;
        count: number;
        msg: string;
        priority: string;
    }

    interface APLQuery {
        apl: string;
        startTime?: string;
        endTime?: string;
    }

    interface TrimRequest {
        maxDuration: string;
    }

    export class Service extends HTTPClient {
        private readonly localPath = '/api/v1/datasets';

        stats = (): Promise<Stats> =>
            this.client.get<Stats>(this.localPath + '/_stats').then((response) => {
                return response.data;
            });

        list = (): Promise<[Dataset]> =>
            this.client.get<[Dataset]>(this.localPath).then((response) => {
                return response.data;
            });

        get = (id: string): Promise<Dataset> =>
            this.client.get<Dataset>(this.localPath + '/' + id).then((response) => {
                return response.data;
            });

        create = (req: CreateRequest): Promise<Dataset> =>
            this.client.post<Dataset>(this.localPath, req).then((response) => {
                return response.data;
            });

        update = (id: string, req: UpdateRequest): Promise<Dataset> =>
            this.client.put<Dataset>(this.localPath + '/' + id, req).then((response) => {
                return response.data;
            });

        delete = (id: string): Promise<AxiosResponse> => this.client.delete<AxiosResponse>(this.localPath + '/' + id);

        info = (id: string): Promise<Info> =>
            this.client.get<Info>(this.localPath + '/' + id + '/info').then((response) => {
                return response.data;
            });

        trim = (id: string, maxDurationStr: string): Promise<TrimResult> => {
            // Go's 'time.Duration' uses nanoseconds as its base unit. So parse the
            // duration string and convert to nanoseconds. 1ms = 1000000ns.
            const req: TrimRequest = { maxDuration: maxDurationStr };
            return this.client.post<TrimResult>(this.localPath + '/' + id + '/trim', req).then((response) => {
                return response.data;
            });
        };

        history = (id: string): Promise<HistoryQuery> =>
            this.client.get<HistoryQuery>(this.localPath + '/_history/' + id).then((response) => {
                return response.data;
            });

        ingest = (
            id: string,
            stream: Stream,
            contentType: ContentType,
            contentEncoding: ContentEncoding,
            options?: IngestOptions,
        ): Promise<IngestStatus> =>
            this.client
                .post<IngestStatus>(this.localPath + '/' + id + '/ingest', stream, {
                    headers: {
                        'Content-Type': contentType,
                        'Content-Encoding': contentEncoding,
                    },
                    params: {
                        'timestamp-field': options?.timestampField,
                        'timestamp-format': options?.timestampFormat,
                        'csv-delimiter': options?.csvDelimiter,
                    },
                })
                .then((response) => {
                    return response.data;
                });

        ingestBuffer = (
            id: string,
            buffer: Buffer,
            contentType: ContentType,
            contentEncoding: ContentEncoding,
            options?: IngestOptions,
        ): Promise<IngestStatus> => this.ingest(id, Readable.from(buffer), contentType, contentEncoding, options);

        ingestString = (
            id: string,
            data: string,
            contentType: ContentType,
            contentEncoding: ContentEncoding,
            options?: IngestOptions,
        ): Promise<IngestStatus> => this.ingest(id, Readable.from(data), contentType, contentEncoding, options);

        query = (id: string, query: Query, options?: QueryOptions): Promise<QueryResult> =>
            this.client
                .post<QueryResult>(this.localPath + '/' + id + '/query', query, {
                    params: {
                        'streaming-duration': options?.streamingDuration,
                        nocache: options?.noCache,
                    },
                })
                .then((response) => {
                    return response.data;
                });

        aplQuery = (apl: string, options?: APLQueryOptions): Promise<QueryResult> => {
            const req: APLQuery = { apl: apl, startTime: options?.startTime, endTime: options?.endTime };
            return this.client
                .post<QueryResult>(this.localPath + '/_apl', req, {
                    params: {
                        'streaming-duration': options?.streamingDuration,
                        nocache: options?.noCache,
                        format: 'legacy',
                    },
                })
                .then((response) => {
                    return response.data;
                });
        };
    }
}
