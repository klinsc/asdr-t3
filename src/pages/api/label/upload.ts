// endpoint: /api/label/upload
// method: POST
// body: FormData
// details: Uploads a label file in xml format to the server
// and saves it to the database
// File format:
// <View>
//     <Image name="image" value="$image" zoom="true" zoomControl="true" rotateControl="true" />
//     <RectangleLabels name="label" toName="image">
//         <Label value="11522_tx_dyn1" background="#6344B2" />
//         <Label value="11522_tx_ynyn0d1" background="#3C57B0" />
//         <Label value="115_1way_ds_w_motor" background="#B2AA0A" />
//         <Label value="115_3ways_ds_w_motor" background="#B20D0D" />
//         <Label value="115_breaker" background="#F20D7A" />
//         <Label value="115_buffer" background="#B20D0D" />
//         <Label value="115_cvt_1p" background="#1CBCD2" />
//         <Label value="115_cvt_3p" background="#E62A64" />
//         <Label value="115_ds" background="#B20D0D" />
//         <Label value="115_gs" background="#B20D3C" />
//         <Label value="115_gs_w_motor" background="#f287f5" />
//         <Label value="115_la" background="#9936AC" />
//         <Label value="115_vt_1p" background="#F1463F" />
//         <Label value="115_vt_3p" background="#199588" />
//         <Label value="22_breaker" background="#3C0DB2" />
//         <Label value="22_cap_bank" background="#0DB24C" />
//         <Label value="22_ds" background="#7AB20D" />
//         <Label value="22_ds_la_out" background="#0DB20D" />
//         <Label value="22_gs" background="#0D0DB2" />
//         <Label value="22_ll" background="#16448c" />
//         <Label value="22_vt_3p" background="#1F9AEE" />
//         <Label value="BCU" background="#B88000" />
//         <Label value="DIM" background="#B20D0D" />
//         <Label value="DPM" background="#B24CCC" />
//         <Label value="LL" background="#0DB2B2" />
//         <Label value="MU" background="#0DACEF" />
//         <Label value="NGR_future" background="#B20DD0" />
//         <Label value="Q" background="#7A0DB2" />
//         <Label value="remote_io_module" background="#0DB2B2" />
//         <Label value="ss_man_mode" background="#F20D3C" />
//         <Label value="tele_protection" background="#0DACEF" />
//         <Label value="terminator_double" background="#0DB27A" />
//         <Label value="terminator_single" background="#0DB2B2" />
//         <Label value="terminator_splicing_kits" background="#FD7AB2" />
//         <Label value="terminator_w_future" background="#0D7AB2" />
//         <Label value="v_m" background="#0DB24C" />
//         <Label value="v_m_digital" background="#0DB27A" />
//     </RectangleLabels>
// </View>
// This will save the label file to the database in the following format:
// {
//   "id": "1",
//   "name": "11522_tx_dyn1",
//   "color": "#6344B2",
//   "description": null,
//   "createdAt": "2021-08-04T16:00:00.000Z",
//   "updatedAt": "2021-08-04T16:00:00.000Z",
//   "componentVersionId": "1"
// }

// using nextjs api routes
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // validate request body
    if (!req.body) {
      throw new Error('No body in request')
    }

    // read form data
    const formData = req.body
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
