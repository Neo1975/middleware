/*
 * Copyright 2021 Mia srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Authentication, authenticationSchema} from '../models'
import {DecoratedFastify, Handler} from '@mia-platform/custom-plugin-lib'

import {readValidateConfiguration} from '../utils/configurationManager'

const readAuthenticationConfiguration = async(fastifyInstance: DecoratedFastify) => {
  const configurationPath = fastifyInstance.config.AUTHENTICATION_CONFIGURATION_PATH || ''
  const validateConfiguration = await readValidateConfiguration(configurationPath as string, authenticationSchema)
  return validateConfiguration as Authentication
}

// @ts-ignore
export const authenticationApiHandlerBuilder = async(fastifyInstance: DecoratedFastify): Promise<Handler<Authentication>> => {
  const configuration: Authentication = await readAuthenticationConfiguration(fastifyInstance)
  return (_, reply) => {
    reply.send(configuration)
  }
}

export const authenticationApiSchema = {
  summary: 'Expose the authentication configuration for micro-lc',
  response: {
    200: authenticationSchema,
  },
} as const
