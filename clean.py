import dns.resolver
import re
import socket
import smtplib
import sys
import os

print("dd")


class email():
    def __init__(self, emaile):
        self.email = emaile
        self.domain = self.getDomain

    def emailsyntax(self):
        addressToVerify = self.email
        match = re.match(
            '^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', addressToVerify)
        if match == None:
            return False
        else:
            return True

    @property
    def getDomain(self):
        splitAddress = self.email.split('@')
        domain = str(splitAddress[1])
        return domain

    @property
    def getmxrecord(self):
        records = dns.resolver.query(self.domain, 'MX')
        mxRecord = records[0].exchange
        mxRecord = str(mxRecord)
        return mxRecord

    def valideEmail(self):
        host = socket.gethostname()
        # SMTP lib setup (use debug level for full output)
        server = smtplib.SMTP()
        server.set_debuglevel(0)
        # SMTP Conversation
        server.connect(host=self.getmxrecord, port=25)
        server.helo(host)
        server.mail('email@hotmail.fr')
        code, message = server.rcpt(str(self.email))
        server.quit()
        # Assume 250 as Success
        if code == 250:
            return True
        else:
            return False


def emailsyntax(email):
    addressToVerify = email
    match = re.match(
        '^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', addressToVerify)
    if match == None:
        return False
    else:
        return True


def main():
    print("here")
    with open('emails.txt', buffering=200000000) as f:
        print("-------Debut---------")
        for row in f:
            if emailsyntax(row.strip()):
                try:
                    eml = email(row.strip())
                    if eml.valideEmail() == True:
                        fc = open('succes.txt', 'a+')
                        print("-------succes----------")
                        print(row)
                        fc.write(row.strip()+'\n')

                        # remove a line containing a string
                        lines = f.readlines()

                        with open("done.txt", 'w') as file:
                            for line in lines:
                                # find() returns -1 if no match is found
                                if line.find(row) != 1:
                                    pass
                                else:
                                    file.write(line)
                        fc.close()
                    else:
                        fb = open('bounce.txt', 'a+')
                        print("-------bounce---------")
                        print(row)
                        fb.write(row.strip()+'\n')
                        lines = f.readlines()

                        with open("done.txt", 'w') as file:
                            for line in lines:
                                # find() returns -1 if no match is found
                                if line.find(row) != 1:
                                    pass
                                else:
                                    file.write(line)
                        fb.close()
                except:
                    pass
        print("-------Fin---------")


if __name__ == '__main__':
    main()
