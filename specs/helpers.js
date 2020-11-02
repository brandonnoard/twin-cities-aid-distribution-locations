import { Selector, ClientFunction, RequestMock, RequestHook } from 'testcafe'
import fiveRecords from './mocked/fiveRecords.json'
import dotenv from 'dotenv'


export const beforeEachTest = async t => {
  await t
    // Language must be selected before anything else can be done
    .click(Selector('.welcome-lang-button').withText('English'))
    // Help window should not be visible at beginning
    .expect(Selector('#help-info').visible).notOk()
}

export const getURL = ClientFunction(() => window.location.href)

export const mockedAirtableResult = RequestMock()
  .onRequestTo(/api.airtable.com/)
  .respond((req, res) => {
    res.headers['content-type'] = 'application/json; charset=utf-8'
    res.headers['access-control-allow-origin'] = '*'
    res.statusCode = 200

    // `offset` means the client wants more data; give it an empty set so it
    // will think it's got everything
    if (req.url.match(/offset/)) {
      res.setBody({records: []})
    }
    else {
      res.setBody(fiveRecords)
    }
  })

class airtableBearer extends RequestHook {
  constructor(env) {
    super(/api\.airtable\.com/, /api\.airtable\.com/)
    this.env = dotenv.config({path: '.env-test'}).parsed
  }

  onRequest(evt) {
    evt.requestOptions.headers['authorization'] = `Bearer ${this.env.SNOWPACK_PUBLIC_AIRTABLE_API_KEY}`
  }
}
export const airtableHook = new airtableBearer()

