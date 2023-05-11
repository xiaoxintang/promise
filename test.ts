import promisesAplusTest from 'promises-aplus-tests'
import myPromise from './index'
promisesAplusTest(Promise,function(err){
    console.log('err',err)
})