export const isFunction = (val: unknown): val is Function =>
    typeof val === 'function'

enum States {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected'
}

export default class MyPromise {
    /**
     * 状态只能从pengind变成fulfilled或者rejected变化后不可再次更改
     * */
    private states: States = States.PENDING

    private value: any
    private reason: any

    private fulfilledCallback = []
    private rejectedCallback = []

    constructor(excutor) {
        try{
            excutor(this._resolve.bind(this), this._reject.bind(this))
        }catch (e) {
            this._reject(e)
        }

    }

    _resolve(value) {
        if (this.states === States.PENDING) {
            this.value = value
            this.states = States.FULFILLED
            if (this.fulfilledCallback.length) {
                this.fulfilledCallback.forEach(fn => fn())
                this.fulfilledCallback = []
            }
        }
    }
    static resolve(data){
        return new MyPromise((resolve)=>resolve(data))
    }
    _reject(reason) {
        if (this.states === States.PENDING) {
            this.reason = reason
            this.states = States.REJECTED
            if (this.rejectedCallback.length) {
                this.rejectedCallback.forEach(fn => fn())
                this.rejectedCallback = []
            }
        }
    }
    static reject(reason){
        return new MyPromise((_,reject)=>{
            reject(reason)
        })
    }
    then(onFulfilled?: Function, onRejected?: Function) {
        return new MyPromise((resolve, reject) => {
            try {
                /**
                 * onFulfilled, onRejected都是可选的，如果不是function将会忽略
                 * onFulfilled, onRejected执行是函数式
                 * */
                if (isFunction(onFulfilled)) {
                    const onFulfilledCallback = () => {
                        resolve(onFulfilled(this.value))
                    }
                    if (this.states === States.PENDING) {
                        /**添加到队列中*/
                        this.fulfilledCallback.push(onFulfilledCallback)
                    } else if (this.states === States.FULFILLED) {
                        onFulfilledCallback()
                    }
                }
                if (isFunction(onRejected)) {
                    const onRejectCallback = () => {
                        reject(onRejected(this.reason))
                    }
                    if (this.states === States.PENDING) {
                        /**添加到队列中*/
                        this.rejectedCallback.push(onRejectCallback)
                    } else if (this.states === States.REJECTED) {
                        onRejectCallback()
                    }
                }
            } catch (e) {
                reject(e)
            }
        })

    }
    catch(onReject){
        return this.then(undefined,onReject)
    }
    defer(){
        let dfd={promise:{},
            resolve:()=>{},
            reject:()=>{}
        }
        dfd.promise = new MyPromise((resolve,reject)=>{
            dfd.resolve = resolve
            dfd.reject = reject
        })
        return dfd
    }
    dferred(){
        return this.defer()
    }

}
