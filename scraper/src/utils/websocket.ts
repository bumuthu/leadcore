const AWS = require('aws-sdk');

export async function send(endpoint: string, connectionId: string, data: any) {
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: endpoint
    })

    const params = {
        ConnectionId: connectionId,
        Data: JSON.stringify(data)
    }
    return apigwManagementApi.postToConnection(params).promise()
}