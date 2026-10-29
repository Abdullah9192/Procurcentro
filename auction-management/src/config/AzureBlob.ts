import { azure } from "./EnvVariables";

interface AzureConfig {
  accountName: string;
  containerName: string;
  connectionString: string;
}

export const azureConfig: AzureConfig = {
  accountName: azure.ACCOUNT_NAME,
  containerName: azure.CONTAINER_NAME,
  connectionString: azure.CONNNECTION_STRING,
};
