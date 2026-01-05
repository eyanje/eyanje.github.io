---
layout: post
date: 2026-01-02
title: Parsing Rent's API responses
---

This week, I created an adapter to specify types for all API calls.

Each API call starts by calling fetch, which returns a promise that resolves
when the server responds with all headers. By inspecting the status code, the
programmer can know whether to deserialize application data or an error message.

To handle this deserialization, I created an `abstract class
APIResponseBody<RawBody, Body>` that can be constructed when given a
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).

```typescript
abstract class APIResponseBody<RB, B> {
	response: Response;

	constructor(response: Response) {
		this.response = response;
	}

	abstract rawBody(): Promise<RB>;
	abstract toBody: (raw: RB) => B;

	body(): Promise<B> {
		return this.rawBody().then(this.toBody);
	}
}
```

Deserialization logic is often split into two steps, first reading data using
`response.json()` and then constructing complex JavaScript classes from the
data. Unfortunately, the necessary second step is not enforced by TypeScript
because `response.json()` returns data in the form `any`. For this reason, I've
explicitly split the deserialization into two typed steps. This makes a direct
trade-off between verbosity and safety, which 

I hoped to make something like Rust's [serde](https://serde.rs/), but I could
find no evidence to suggest that TypeScript could perform static dispatch.

A complete `APIResponse` consists of an HTTP response, a parser for a successful
response, and a parser for errors.

```typescript
type APIResponseBodyConstructor<RB, B> = new (response: Response) => APIResponseBody<RB, B>;

class APIResponse<B, E> {
	http: Response;
	successBody: APIResponseBody<any, B>;
	errorBody: APIResponseBody<any, E>;

	constructor(
		response: typeof this.http,
		successBody: APIResponseBodyConstructor<any, B>,
		errorBody: APIResponseBodyConstructor<any, E>,
	) {
		this.http = response;
		this.successBody = new successBody(response);
		this.errorBody = new errorBody(response);
	}

	async body(): Promise<B> {
		return this.successBody.body();
	}

	async error(): Promise<E> {
		return this.errorBody.body();
	}
}
```

Originally, `APIResponse` was abstract and required implementations for parsing
successes and errors, but it made sense to split them into separate abstract
classes. This change also allowed me to remove both `RawBody` types from
`APIResponse`'s type signature, using `any` instead.

## Next week

I've been developing rent for a long time, and I haven't made much progress
beyond the initial prototype. There is strong infrastructure for calendar logic,
but account creation is insecure, the back end outputs a variety of types, and
the front end is untested.

Rent lacks a serious roadmap, so, next week, I will put other tasks on hold to
break down the application's components and develop a schedule.

