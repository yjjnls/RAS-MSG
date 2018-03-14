1. 所有msg（包括相关信息）如何存储
考虑存入hash， msg:uuid  
hash中各个key-val就是msg的各个属性  

存入一个hash， key为uuid value为其他属性的json字符串

2. 消息timeout如何设置与处理
3. 订阅通知如何处理？拉模式？除了1中存储结构，还需要另外的结构么？

4. 是否要加锁？如果只有ras操作redis，那么不需要加锁，如果是downstream拉取消息后也要delete消息，那么就是两个线程会操作redis，得加锁
不需要加锁