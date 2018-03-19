# 推送消息 
POST /msg?topic=xxx 
header:{
    "from":"http://......"
} 
{
    "data": "xxx
}
将消息推送到消息系统，系统保存消息及其相关信息

返回消息ID（uuid, 消息体中）
200 OK
{
    "uuid": "......"
}

# 发布消息
PUT  /msg?id=xxx
生产者本地事务完成，让消息系统发布消息，消息会推送给相关联的消费者。
**回复200 OK只能表示RAS收到了http消息，并不能表示后续逻辑正确执行。**

# 消费消息
DELETE /msg?id=xxx&topic=xxx
消费者完成本地事务，告诉消息系统，消息已经消费完成。
**回复200 OK只能表示RAS收到了http消息，并不能表示后续逻辑正确执行。**

# 查询业务是否执行(上游应用API)
GET /msg?id=xxx

200 OK
{
    "msg": "done/undo"
}