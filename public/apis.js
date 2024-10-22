/** @type {import('next').NextConfig} */

const SERVER = process.env.NEXT_PUBLIC_DSA_LOCAL;

if (!SERVER) {
    throw new Error('NEXT_PUBLIC_DSA_LOCAL is not defined');
  }

const apis = {
    //USER ADMIN
    userSignUp: `${SERVER}user/signUp`,
    userLogin: `${SERVER}user/loginUser`,
    verifyToken: `${SERVER}user/verifyToken`,

    //CLIENT
    createClient: `${SERVER}user/createClient`,
    getAllClient: `${SERVER}user/getAllClient`,
    getMembersForGroup: `${SERVER}user/getMembersForGroup`,
    getAllClientCount: `${SERVER}user/getAllClientCount`,
    getClientById: `${SERVER}user/getClientById/`,
    updateClientById: `${SERVER}user/updateClientById/`,
    deleteClientById: `${SERVER}user/deleteClientById/`,
    deleteClients: `${SERVER}user/deleteClients`,
    clientProfilePictureUpdate: `${SERVER}user/updateClientProfile`,
    importContacts: `${SERVER}clientsImpExp/importClientFromCSV`,
    exportContacts: `${SERVER}clientsImpExp/exportClientToCSV`,

    multiProfilePics: `${SERVER}user/bulkProfilePictureUpload`,
    multiCompanyProfilePics: `${SERVER}user/bulkCompanyProfilePictureUpload`,

    //GROUP
    createGroup: `${SERVER}user/createGroup`,
    updateGroupById: `${SERVER}user/updateGroupById/`,
    deleteGroupById: `${SERVER}user/deleteGroupById/`,
    getGroupById: `${SERVER}user/getGroupById/`,
    getAllGroups: `${SERVER}user/getAllGroups`,
    getAllGroupsName: `${SERVER}user/getAllGroupsName`,

    //TRASH
    getAllDeletedClient: `${SERVER}user/getAllDeletedClient`,
    hardDeleteClients: `${SERVER}user/hardDeleteClients`,
    restoreClients: `${SERVER}user/restoreClients`,

    //TEMPLATE
    templateImageUpload: `${SERVER}template/templateImageUpload`,
    templateFormatUpload: `${SERVER}template/templateFormatUpload`,
    templateReferenceFormatUpload: `${SERVER}template/templateReferenceFormatUpload`,
    getAllTemplateImages: `${SERVER}template/getAllTemplateImages`,
    getAllTemplateFormat: `${SERVER}template/getAllTemplateFormat`,
    getAllReferenceTemplateFormat: `${SERVER}template/getAllReferenceTemplateFormat`,
    getAllTemplates: `${SERVER}template/getAllTemplates`,
    createTemplate: `${SERVER}template/createTemplate`,
    deleteTemplate: `${SERVER}template/deleteTemplate`,
    testAPI: `${SERVER}template/testAPI`,

    //CAMPAIGN
    createCampaignMarketing:`${SERVER}campaign/createCampaignMarketing`,
    createCampaignUtility:`${SERVER}campaign/createCampaignUtility`,
    sendMessage:`${SERVER}campaign/sendMessage`,
    getAllCampaigns:`${SERVER}campaign/getAllCampaigns`,
    campaignAudienceCount:`${SERVER}campaign/campaignAudienceCount`,

    //VARIABLES
    createVariable: `${SERVER}template/createVariable`,
    getAllVariables: `${SERVER}template/getAllVariables`,
    getVariableById: `${SERVER}template/getVariableById`,
    deleteVariableById: `${SERVER}template/deleteVariableById`,
};

module.exports = apis;
