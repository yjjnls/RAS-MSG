1.  所有msg（包括相关信息）如何存储
    考虑存入hash， msg:uuid  
    hash中各个key-val就是msg的各个属性  

存入一个hash， key为uuid value为其他属性的json字符串

2.  消息timeout如何设置与处理
3.  订阅通知如何处理？拉模式？除了1中存储结构，还需要另外的结构么？
    考虑以topic:xxx为key 的list，存入对应topic消息的uuid，然后根据uuid，向1中结构获取数据

push模式需要订阅端一直在线，断线可能会导致订阅端消息丢失。同时还要考虑订阅端的消息消费速度是否能够跟上，在消息量大时，订阅端要根据自己实际的处理速度来获取等量的消息，而不是直接获取所有消息。  
设计：

## 创建 MQ

-   ras会对每一个接收到的msg分配一个msg_id，msg_id为基于时间戳产生的uuid（递增）。
-   每个topic对应redis中一个群组，用zset来存储。
    zset名称为topic:xxx，zset成员为消息，zset分值为msg_id。
    ```
    .───── topic:xxx ──── zset ────╮
    |￣￣￣￣￣￣￣￣￣|￣￣￣￣￣￣￣|
    |     msg_data    |   msg_id  |
    ╰────────────────────────────────╯
    ```
-   所有订阅该topic的服务会由一个zset来记录。
    zset名称为sub:topicxxx，成员为订阅该主题的服务名称，分值为订阅服务收到的最大msg_id（初始化为0）。
-   每个服务订阅了哪些topic又一个zset来记录。
    zset名称为service:xxx，成员为topic，分值为该topic中获取的最大msg_id。

## 推送消息到 MQ

-   获取topic:xxx的分布式锁
-   将消息添加到topic:xxx
-   释放分布式锁

## 从 MQ 获取消息

-   zrange遍历service:xxx，获取订阅的topic，和每个topic中收到的最新消息。
-   

4.  是否要加锁？如果只有ras操作redis，那么不需要加锁，如果是downstream拉取消息后也要delete消息，那么就是两个线程会操作redis，得加锁
redis的使用分为两个部分，第一个部分是用于持久化ras中收到的消息，这个部分只有ras进行操作，不需要加锁。    
第二个部分是利用redis作为一个MQ，这里考虑采取pull模式，订阅端需要读取数据，而推送端又要发布数据，这里需要加锁。
