import { Alt2 } from './Alt'
import { Applicative } from './Applicative'
import { Bifunctor2 } from './Bifunctor'
import { ChainRec2, tailRec } from './ChainRec'
import { Extend2 } from './Extend'
import { Foldable2 } from './Foldable'
import { HKT } from './HKT'
import { Monad2 } from './Monad'
import { Option } from './Option'
import { Setoid } from './Setoid'
import { Traversable2 } from './Traversable'
import { Validation } from './Validation'
import { Lazy, Predicate, toString } from './function'

declare module './HKT' {
  interface URI2HKT2<L, A> {
    Either: Either<L, A>
  }
}

export const URI = 'Either'

export type URI = typeof URI

/**
 * Represents a value of one of two possible types (a disjoint union).
 *
 * An instance of `Either` is either an instance of `Left` or `Right`.
 *
 * A common use of `Either` is as an alternative to `Option` for dealing with possible missing values. In this usage,
 * `None` is replaced with a `Left` which can contain useful information. `Right` takes the place of `Some`. Convention
 * dictates that `Left` is used for failure and `Right` is used for success.
 *
 * For example, you could use `Either<string, number>` to detect whether a received input is a `string` or a `number`.
 *
 * ```ts
 * const parse = (errorMessage: string) => (input: string): Either<string, number> => {
 *   const n = parseInt(input, 10)
 *   return isNaN(n) ? left(errorMessage) : right(n)
 * }
 * ```
 *
 * `Either` is right-biased, which means that `Right` is assumed to be the default case to operate on. If it is `Left`,
 * operations like `map`, `chain`, ... return the `Left` value unchanged:
 *
 * ```ts
 * right(12).map(double) // right(24)
 * left(23).map(double)  // left(23)
 * ```
 *
 * @data
 * @constructor Left
 * @constructor Right
 * @since 1.0.0
 */
export type Either<L, A> = Left<L, A> | Right<L, A>

export class Left<L, A> {
  readonly _tag: 'Left' = 'Left'
  readonly _A!: A
  readonly _L!: L
  readonly _URI!: URI
  constructor(readonly value: L) {}
  /** The given function is applied if this is a `Right` */
  map<B>(f: (a: A) => B): Either<L, B> {
    return this as any
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    return (fab.isLeft() ? fab : this) as any
  }
  ap_<B, C>(this: Either<L, (b: B) => C>, fb: Either<L, B>): Either<L, C> {
    return fb.ap(this)
  }
  /** Binds the given function across `Right` */
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return this as any
  }
  bimap<V, B>(f: (l: L) => V, g: (a: A) => B): Either<V, B> {
    return new Left(f(this.value))
  }
  alt(fy: Either<L, A>): Either<L, A> {
    return fy
  }

  /**
   * Lazy version of {@link alt}
   * @since 1.6.0
   * @param {(l: L) => Either<M, A>} fy - thunk
   * @example
   * assert.deepEqual(right(1).orElse(() => right(2)), right(1))
   * @returns {Either<M, A>}
   */
  orElse<M>(fy: (l: L) => Either<M, A>): Either<M, A> {
    return fy(this.value)
  }
  extend<B>(f: (ea: Either<L, A>) => B): Either<L, B> {
    return this as any
  }
  reduce<B>(b: B, f: (b: B, a: A) => B): B {
    return b
  }
  /** Applies a function to each case in the data structure */
  fold<B>(whenLeft: (l: L) => B, whenRight: (a: A) => B): B {
    return whenLeft(this.value)
  }
  /** Returns the value from this `Right` or the given argument if this is a `Left` */
  getOrElse(a: A): A {
    return a
  }
  /** Returns the value from this `Right` or the result of given argument if this is a `Left` */
  getOrElseL(f: (l: L) => A): A {
    return f(this.value)
  }
  /** Maps the left side of the disjunction */
  mapLeft<M>(f: (l: L) => M): Either<M, A> {
    return new Left(f(this.value))
  }
  inspect(): string {
    return this.toString()
  }
  toString(): string {
    return `left(${toString(this.value)})`
  }
  /** Returns `true` if the either is an instance of `Left`, `false` otherwise */
  isLeft(): this is Left<L, A> {
    return true
  }
  /** Returns `true` if the either is an instance of `Right`, `false` otherwise */
  isRight(): this is Right<L, A> {
    return false
  }
  /** Swaps the disjunction values */
  swap(): Either<A, L> {
    return new Right(this.value)
  }
  /**
   * Returns `Right` with the existing value of `Right` if this is a `Right` and the given predicate `p` holds for the
   * right value, returns `Left(zero)` if this is a `Right` and the given predicate `p` does not hold for the right
   * value, returns `Left` with the existing value of `Left` if this is a `Left`.
   *
   * ```ts
   * right(12).filterOrElse(n => n > 10, -1) // right(12)
   * right(7).filterOrElse(n => n > 10, -1)  // left(-1)
   * left(12).filterOrElse(n => n > 10, -1)  // left(12)
   * ```
   * @since 1.3.0
   */
  filterOrElse(p: Predicate<A>, zero: L): Either<L, A> {
    return this
  }
  /**
   * Lazy version of `filterOrElse`
   * @since 1.3.0
   */
  filterOrElseL(p: Predicate<A>, zero: () => L): Either<L, A> {
    return this
  }
}

export class Right<L, A> {
  readonly _tag: 'Right' = 'Right'
  readonly _A!: A
  readonly _L!: L
  readonly _URI!: URI
  constructor(readonly value: A) {}
  map<B>(f: (a: A) => B): Either<L, B> {
    return new Right(f(this.value))
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    return fab.isRight() ? this.map(fab.value) : left(fab.value)
  }
  ap_<B, C>(this: Either<L, (b: B) => C>, fb: Either<L, B>): Either<L, C> {
    return fb.ap(this)
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return f(this.value)
  }
  bimap<V, B>(f: (l: L) => V, g: (a: A) => B): Either<V, B> {
    return new Right<V, B>(g(this.value))
  }
  alt(fy: Either<L, A>): Either<L, A> {
    return this
  }
  orElse<M>(fy: (l: L) => Either<M, A>): Either<M, A> {
    return this as any
  }
  extend<B>(f: (ea: Either<L, A>) => B): Either<L, B> {
    return new Right(f(this))
  }
  reduce<B>(b: B, f: (b: B, a: A) => B): B {
    return f(b, this.value)
  }
  fold<B>(whenLeft: (l: L) => B, whenRight: (a: A) => B): B {
    return whenRight(this.value)
  }
  getOrElse(a: A): A {
    return this.value
  }
  getOrElseL(f: (l: L) => A): A {
    return this.value
  }
  mapLeft<M>(f: (l: L) => M): Either<M, A> {
    return new Right(this.value)
  }
  inspect(): string {
    return this.toString()
  }
  toString(): string {
    return `right(${toString(this.value)})`
  }
  isLeft(): this is Left<L, A> {
    return false
  }
  isRight(): this is Right<L, A> {
    return true
  }
  swap(): Either<A, L> {
    return new Left(this.value)
  }
  filterOrElse(p: Predicate<A>, zero: L): Either<L, A> {
    return p(this.value) ? this : left(zero)
  }
  filterOrElseL(p: Predicate<A>, zero: () => L): Either<L, A> {
    return p(this.value) ? this : left(zero())
  }
}

/**
 * @function
 * @since 1.0.0
 */
export const getSetoid = <L, A>(SL: Setoid<L>, SA: Setoid<A>): Setoid<Either<L, A>> => {
  return {
    equals: (x, y) =>
      x.isLeft() ? y.isLeft() && SL.equals(x.value, y.value) : y.isRight() && SA.equals(x.value, y.value)
  }
}

const map = <L, A, B>(fa: Either<L, A>, f: (a: A) => B): Either<L, B> => {
  return fa.map(f)
}

const of = <L, A>(a: A): Either<L, A> => {
  return new Right<L, A>(a)
}

const ap = <L, A, B>(fab: Either<L, (a: A) => B>, fa: Either<L, A>): Either<L, B> => {
  return fa.ap(fab)
}

const chain = <L, A, B>(fa: Either<L, A>, f: (a: A) => Either<L, B>): Either<L, B> => {
  return fa.chain(f)
}

const bimap = <L, V, A, B>(fla: Either<L, A>, f: (u: L) => V, g: (a: A) => B): Either<V, B> => {
  return fla.bimap(f, g)
}

const alt = <L, A>(fx: Either<L, A>, fy: Either<L, A>): Either<L, A> => {
  return fx.alt(fy)
}

const extend = <L, A, B>(ea: Either<L, A>, f: (ea: Either<L, A>) => B): Either<L, B> => {
  return ea.extend(f)
}

const reduce = <L, A, B>(fa: Either<L, A>, b: B, f: (b: B, a: A) => B): B => {
  return fa.reduce(b, f)
}

const traverse = <F>(F: Applicative<F>) => <L, A, B>(
  ta: Either<L, A>,
  f: (a: A) => HKT<F, B>
): HKT<F, Either<L, B>> => {
  return ta.isLeft() ? F.of(left(ta.value)) : F.map(f(ta.value), of as ((a: B) => Either<L, B>))
}

const chainRec = <L, A, B>(a: A, f: (a: A) => Either<L, Either<A, B>>): Either<L, B> => {
  return tailRec(e => {
    if (e.isLeft()) {
      return right(left(e.value))
    } else {
      const r = e.value
      return r.isLeft() ? left(f(r.value)) : right(right(r.value))
    }
  }, f(a))
}

/**
 * Constructs a new `Either` holding a `Left` value. This usually represents a failure, due to the right-bias of this
 * structure
 * @function
 * @since 1.0.0
 */
export const left = <L, A>(l: L): Either<L, A> => {
  return new Left(l)
}

/**
 * Constructs a new `Either` holding a `Right` value. This usually represents a successful value due to the right bias
 * of this structure
 * @function
 * @since 1.0.0
 * @alias of
 */
export const right = of

/**
 * @function
 * @since 1.0.0
 */
export const fromPredicate = <L, A>(predicate: Predicate<A>, whenFalse: (a: A) => L) => (a: A): Either<L, A> => {
  return predicate(a) ? right(a) : left(whenFalse(a))
}

/**
 * Takes a default and a `Option` value, if the value is a `Some`, turn it into a `Right`, if the value is a `None` use
 * the provided default as a `Left`
 * @function
 * @since 1.0.0
 */
export const fromOption = <L>(defaultValue: L) => <A>(fa: Option<A>): Either<L, A> => {
  return fa.isNone() ? left(defaultValue) : right(fa.value)
}

/**
 * Lazy version of `fromOption`
 * @function
 * @since 1.3.0
 */
export const fromOptionL = <L>(defaultValue: Lazy<L>) => <A>(fa: Option<A>): Either<L, A> => {
  return fa.isNone() ? left(defaultValue()) : right(fa.value)
}

/**
 * Takes a default and a nullable value, if the value is not nully, turn it into a `Right`, if the value is nully use
 * the provided default as a `Left`
 * @function
 * @since 1.0.0
 */
export const fromNullable = <L>(defaultValue: L) => <A>(a: A | null | undefined): Either<L, A> => {
  return a == null ? left(defaultValue) : right(a)
}

/**
 * Default value for the optional `onerror` argument of `tryCatch`
 * @function
 * @since 1.0.0
 */
export const toError = (e: {}): Error => {
  if (e instanceof Error) {
    return e
  } else {
    return new Error(String(e))
  }
}

/**
 * @function
 * @since 1.0.0
 */
export const tryCatch = <A>(f: Lazy<A>, onerror: (e: {}) => Error = toError): Either<Error, A> => {
  try {
    return right(f())
  } catch (e) {
    return left(onerror(e))
  }
}

/**
 * @function
 * @since 1.0.0
 */
export const fromValidation = <L, A>(fa: Validation<L, A>): Either<L, A> => {
  return fa.isFailure() ? left(fa.value) : right(fa.value)
}

/**
 * Returns `true` if the either is an instance of `Left`, `false` otherwise
 * @function
 * @since 1.0.0
 */
export const isLeft = <L, A>(fa: Either<L, A>): fa is Left<L, A> => {
  return fa.isLeft()
}

/**
 * Returns `true` if the either is an instance of `Right`, `false` otherwise
 * @function
 * @since 1.0.0
 */
export const isRight = <L, A>(fa: Either<L, A>): fa is Right<L, A> => {
  return fa.isRight()
}

/**
 * @instance
 * @since 1.0.0
 */
export const either: Monad2<URI> &
  Foldable2<URI> &
  Traversable2<URI> &
  Bifunctor2<URI> &
  Alt2<URI> &
  Extend2<URI> &
  ChainRec2<URI> = {
  URI,
  map,
  of,
  ap,
  chain,
  reduce,
  traverse,
  bimap,
  alt,
  extend,
  chainRec
}
