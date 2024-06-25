class Response{
    constructor(){}
    serverError(res, data){
        return res.status(500).json({
            err: true,
            data: data,
            message: "Server Error",
            code: 500
        })
    }

    successResponse(res, msg, data = "No data for it", ){
        return res.status(200).json({
            err: false,
            data: data,
            message: msg,
            code: 200
        });
    }

    errorResponse(res, msg, code){
        return res.status(code).json({
            err: true,
            message: msg,
            code: code
        })
    }
}
module.exports = Response