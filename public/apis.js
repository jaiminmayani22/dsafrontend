/** @type {import('next').NextConfig} */

const SERVER = process.env.NEXT_PUBLIC_DSA_LOCAL;

if (!SERVER) {
    throw new Error('NEXT_PUBLIC_DSA_LOCAL is not defined');
  }

const apis = {
    userSignUp: `${SERVER}user/signUp`,
    userLogin: `${SERVER}user/loginUser`,
    createClient: `${SERVER}user/createClient`,
    getAllClient: `${SERVER}user/getAllClient`,
    getAllClientCount: `${SERVER}user/getAllClientCount`,
    getClientById: `${SERVER}user/getClientById/`,
    updateClientById: `${SERVER}user/updateClientById/`,
    deleteClientById: `${SERVER}user/deleteClientById/`,
    clientProfilePictureUpdate: `${SERVER}user/updateClientProfile`,
    importContacts: `${SERVER}clientsImpExp/importClientFromCSV`,
    exportContacts: `${SERVER}clientsImpExp/exportClientToCSV`,
    createGroup: `${SERVER}user/createGroup`,
    getAllGroups: `${SERVER}user/getAllGroups`,
};

module.exports = apis;
