import { Either, Failure, Success, failure, success } from './either.js';

function doSomething(shouldSuccess: boolean): Either<string, string> {
  if (shouldSuccess) {
    return success('success');
  } else {
    return failure('failure');
  }
}

test('success result', () => {
  const successResult = doSomething(true);

  expect(successResult.value).toEqual('success');
  expect(successResult.isSuccess()).toBe(true);
  expect(successResult.isFailure()).toBe(false);
  expect(successResult).toBeInstanceOf(Success);
});

test('failure result', () => {
  const failureResult = doSomething(false);

  expect(failureResult.value).toEqual('failure');
  expect(failureResult.isSuccess()).toBe(false);
  expect(failureResult.isFailure()).toBe(true);
  expect(failureResult).toBeInstanceOf(Failure);
});
