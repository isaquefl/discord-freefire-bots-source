const { QRCodeStyling } = require('qr-code-styling-node/lib/qr-code-styling.common');
const canvas = require('canvas');

/**
 * @param {string} data
 * @param {string} imagePath
 */

class qrGenerator {
    constructor(
        {
            imagePath: imagePath,
        }
    ) {
        this.imagePath = imagePath
    }

    generate = async function (data) {

        // Cria as opções do QRCodeStyling
        this.options = createOptions(data, this.imagePath);

        // Cria o QRCodeStyling
        this.qrCodeImage = createQRCodeStyling(canvas, this.options);

        // Obtém os dados brutos do QRCodeStyling
        return await getRawData(this.qrCodeImage);

    }

}

// cria as opções do QRCodeStyling
function createOptions(data, image) {
    return {
        width: 1000,
        height: 1000,
        data, image,
        margin: 10,
        dotsOptions: {
            color: "#000000",
            type: "dots"
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        imageOptions: {
            crossOrigin: "anonymous",
            imageSize: 0.4,
            margin: 5
        },
        cornersDotOptions: {
            color: "#000000",
            type: 'dot'
        },
        cornersSquareOptions: {
            color: "#000000",
            type: 'extra-rounded'
        },
        cornersDotOptionsHelper: {
            color: "#000000",
            type: 'extra-rounded'
        }
    };
}

// cria o QRCodeStyling
function createQRCodeStyling(nodeCanvas, options) {
    return new QRCodeStyling({
        nodeCanvas, ...options
    });
}

// obter os dados do QRCodeStyling
async function getRawData(qrCodeImage) {
    return qrCodeImage.getRawData("png").then(r => {
        return {
            status: 'success',
            response: r.toString('base64')
        }
    }).catch(e => {
        return {
            status: 'error',
            response: e
        }
    });
}

module.exports.qrGenerator = qrGenerator;