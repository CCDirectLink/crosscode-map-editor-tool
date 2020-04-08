import { Observable } from "rxjs";

export class ObservableHelper {
    static toObservable<T>(promise: Promise<T>): Observable<T> {
        return new Observable<T>(subsriber => {
            promise
                .then(value => subsriber.next(value))
                .catch(err => subsriber.error(err))
                .finally(() => subsriber.complete());
        });
    }
}