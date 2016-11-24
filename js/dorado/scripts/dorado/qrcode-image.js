


(function () {
    var QRCodeType = {FREE_TEXT:"FreeText", PHONE_NUMBER:"PhoneNumber", SMS_ADDRESS:"SmsAddress", CONTACT_INFO:"ContactInfo", EMAIL:"Email", URL:"Url", WIFI:"Wifi", CALENDAR_EVENT:"CalendarEvent"};
    var RegExpValidator = {RE_EMAIL:/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/, RE_PHONE:/^(0?1[358]\d{9})$|^((0(10|2[1-3]|[3-9]\d{2}))?[1-9]\d{6,7})$/, RE_MOBILE_PHONE:/^0?1[358]\d{9}$/, RE_URL:/^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/, doValidator:function (reg, value, errorMsg) {
        if (!reg.test(value)) {
            throw new dorado.Exception(errorMsg + " format error!");
        } else {
            return true;
        }
    }};
    dorado.widget.QRCodeImage = $extend(dorado.widget.Control, {$className:"dorado.widget.QRCodeImage", _inherentClassName:"i-qrcode-img", ATTRIBUTES:{className:{defaultValue:"d-qrcode-img"}, data:{setter:function (data) {
        if (data) {
            this._data = data;
        }
    }}, type:{setter:function (t) {
        this._type = t;
    }, defaultValue:QRCodeType.FREE_TEXT}, errorCorrectionLevel:{setter:function (ecl) {
        if (ecl) {
            this._errorCorrectionLevel = ecl;
        }
    }, defaultValue:"L"}, outputFomart:{setter:function (opf) {
        if (opf) {
            this._outputFomart = opf;
        }
    }, defaultValue:"png"}, characterSet:{setter:function (cs) {
        if (cs) {
            this._characterSet = cs;
        }
    }}, quietZoneSize:{setter:function (qzs) {
        if (qzs) {
            this._quietZoneSize = qzs;
        }
    }}, sideLength:{defaultValue:350}, validatorsDisabled:{defaultValue:false}, color:{defaultValue:"#000000"}, backgroundColor:{defaultValue:"#FFFFFF"}, logo:{defaultValue:"DEFAULT_LOGO"}, renderStyle:{}, blankImage:{defaultValue:$url(">dorado/client/resources/qrcode-wt.gif")}}, constructor:function () {
        $invokeSuper.call(this, arguments);
        this._url = "dorado/qrcodegenerator?";
    }, createDom:function () {
        var qrimg = this, dom;
        dom = $DomUtils.xCreate({tagName:"img", src:qrimg._blankImage});
        return dom;
    }, onReady:function () {
        $invokeSuper.call(this);
        if (this._data) {
            this.generateQRCode();
        }
    }, assemblyQRText:function (type, data) {
        if (!data) {
            this.set("tip", "No Data");
            throw new dorado.AbortException();
        } else {
            this.set("tip", null);
        }
        if (!(typeof (data) == "object" && Object.prototype.toString.call(data).toLowerCase() == "[object object]" && !data.length)) {
            try {
                data = dorado.JSON.parse(data);
            }
            catch (e) {
                data = {text:data};
            }
        }
        var output;
        switch (type) {
          case QRCodeType.FREE_TEXT:
            output = this.fomartFreeText(data);
            break;
          case QRCodeType.PHONE_NUMBER:
            output = this.fomartPhoneNumber(data);
            break;
          case QRCodeType.SMS_ADDRESS:
            output = this.fomartSms(data);
            break;
          case QRCodeType.CONTACT_INFO:
            output = this.fomartContactInfo(data);
            break;
          case QRCodeType.EMAIL:
            output = this.fomartEmail(data);
            break;
          case QRCodeType.URL:
            output = this.fomartUrl(data);
            break;
          case QRCodeType.WIFI:
            output = this.fomartWIFI(data);
            break;
          case QRCodeType.CALENDAR_EVENT:
            output = this.fomartCalendarEvent(data);
            break;
        }
        return escape(encodeURI(output));
    }, fomartFreeText:function (jObject) {
        var text = jObject.text;
        return text;
    }, fomartPhoneNumber:function (jObject) {
        var phoneNum = jObject.phoneNum;
        if (!this._validatorsDisabled) {
            RegExpValidator.doValidator(RegExpValidator.RE_PHONE, phoneNum, "Phone");
        }
        return "tel:" + phoneNum;
    }, fomartUrl:function (jObject) {
        var url = jObject.url;
        if (!this._validatorsDisabled) {
            RegExpValidator.doValidator(RegExpValidator.RE_URL, url, "Website");
        }
        return url;
    }, fomartSms:function (jObject) {
        var message = jObject.message;
        var phoneNum = jObject.phoneNum;
        if (!this._validatorsDisabled) {
            var rs = RegExpValidator.doValidator(RegExpValidator.RE_MOBILE_PHONE, phoneNum, "Mobile phone");
            if (message.length > 150) {
                throw new dorado.Exception("Sms message can not be longer than 150 characters.");
            }
        }
        return "smsto:" + phoneNum + ":" + message;
    }, fomartEmail:function (jObject) {
        var email = jObject.email;
        if (!this._validatorsDisabled) {
            RegExpValidator.doValidator(RegExpValidator.RE_EMAIL, email, "E-Mail");
        }
        return "mailto:" + email;
    }, fomartWIFI:function (jObject) {
        var ssid = jObject.ssid;
        var password = jObject.password;
        var networkType = jObject.networkType;
        ssid = ssid.replace(";", "\\;").replace(":", "\\:").replace("\\", "\\\\").replace("/", "\\/");
        password = password.replace(";", "\\;").replace(":", "\\:").replace("\\", "\\\\").replace("/", "\\/");
        return "WIFI:S:" + ssid + ";T:" + networkType + ";P:" + password + ";";
    }, fomartContactInfo:function (jObject) {
        var name = jObject.name;
        var company = jObject.company;
        var tel = jObject.tel;
        var url = jObject.url;
        var email = jObject.email;
        var address = jObject.address;
        var memo = jObject.memo;
        var type = jObject.type;
        if (!this._validatorsDisabled) {
            RegExpValidator.doValidator(RegExpValidator.RE_PHONE, tel, "Phone");
            RegExpValidator.doValidator(RegExpValidator.RE_EMAIL, email, "E-Mail");
            RegExpValidator.doValidator(RegExpValidator.RE_URL, url, "URL");
            if (name.length <= 1) {
                throw new dorado.Exception("Name must be at least 1 character.");
            }
        }
        if (type === "vcard") {
            return "BEGIN:VCARD\nN:" + name + "\nORG:" + company + "\nTEL:" + tel + "\nURL:" + url + "\nEMAIL:" + email + "\nADR:" + address + "\nNOTE:" + memo + "\nEND:VCARD\n";
        } else {
            return "MECARD:N:" + name + ";ORG:" + company + ";TEL:" + tel + ";URL:" + url + ";EMAIL:" + email + ";ADR:" + address + ";NOTE:" + memo + ";;";
        }
    }, fomartCalendarEvent:function (jObject) {
        var eventName = jObject.eventName;
        var fullDay = jObject.fullDay;
        var startDate = jObject.startDate;
        var endDate = jObject.endDate;
        var location = jObject.location;
        var description = jObject.description;
        var formartStartDate, formartEndDate;
        if (eventName && startDate && endDate && location && description) {
            eventName = "SUMMARY:" + eventName + "\n";
            location = "LOCATION:" + location + "\n";
            description = "DESCRIPTION:" + description + "\n";
            if (fullDay) {
                formartStartDate = "DTSTART;VALUE=DATE:" + startDate.formatDate("Ymd") + "\n";
                formartEndDate = "DTEND;VALUE=DATE:" + endDate.formatDate("Ymd") + "\n";
            } else {
                formartStartDate = "DTSTART:" + startDate.formatDate("Ymd") + "T" + startDate.formatDate("His") + "Z\n";
                formartEndDate = "DTEND:" + endDate.formatDate("Ymd") + "T" + endDate.formatDate("His") + "Z\n";
            }
            return "BEGIN:VEVENT\n" + eventName + formartStartDate + formartEndDate + location + description + "END:VEVENT\n";
        } else {
            throw new dorado.Exception("All information must be set.");
        }
    }, generateQRCode:function () {
        try {
            var imgDom = this._dom;
            if (imgDom.offsetWidth < imgDom.offsetHeight) {
                this._sideLength = imgDom.clientWidth;
            } else {
                this._sideLength = imgDom.clientHeight;
            }
            var url = this._url;
            if (this._errorCorrectionLevel) {
                url += "&ecl=" + this._errorCorrectionLevel;
            }
            if (this._characterSet) {
                url += "&cs=" + this._characterSet;
            }
            if (this._quietZoneSize && this._quietZoneSize != 4) {
                url += "&qzs=" + this._quietZoneSize;
            }
            if (this._sideLength) {
                url += "&sl=" + this._sideLength;
            }
            if (this._color && this._color != "#000000") {
                url += "&clr=" + this._color.substring(1);
            }
            if (this._backgroundColor && this._backgroundColor != "#FFFFFF") {
                url += "&bgclr=" + this._backgroundColor.substring(1);
            }
            if (this._renderStyle) {
                url += "&rs=" + this._renderStyle;
            }
            if (this._logo) {
                url += "&lg=" + this._logo;
            }
            url += "&opf=" + this._outputFomart;
            url += "&dt=" + this.assemblyQRText(this._type, this._data);
            $fly(imgDom).attr("src", url);
        }
        catch (e) {
            dorado.Exception.processException(e);
        }
    }});
})();

