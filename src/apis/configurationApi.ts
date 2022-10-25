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

import {Configuration, configurationRecursiveSchema, InternalPlugin, Plugin} from '../models'
import {DecoratedFastify, Handler} from '@mia-platform/custom-plugin-lib'

import {readValidateConfiguration} from '../utils/configurationManager'
import {aclExpressionEvaluator} from '../utils/aclExpressionEvaluator'
import {getPermissions} from '../utils/getPermissions'

const readPluginConfiguration = async(fastifyInstance: DecoratedFastify) => {
  const configurationPath = fastifyInstance.config.MICROLC_CONFIGURATION_PATH as string
  const validateConfiguration = await readValidateConfiguration(configurationPath, configurationRecursiveSchema)
  return validateConfiguration as Configuration
}

const buildNewConfiguration = (oldConfiguration: Configuration, allowedPlugins: Plugin[], allowedInternalPlugins: InternalPlugin[]): Configuration => {
  return {
    ...oldConfiguration,
    plugins: allowedPlugins,
    internalPlugins: allowedInternalPlugins,
  }
}

// @ts-ignore
export const configurationApiHandlerBuilder = async(fastifyInstance: DecoratedFastify): Promise<Handler<Configuration>> => {
  const configuration: Configuration = await readPluginConfiguration(fastifyInstance)
  const userPropertiesHeader = fastifyInstance.config.USER_PROPERTIES_HEADER_KEY

  return (request, reply) => {
    const userGroups = request.getGroups()
    const userPermissions = getPermissions(request, userPropertiesHeader as string)
    const allowedPlugins = aclExpressionEvaluator(configuration.plugins || [], userGroups, userPermissions)
    const allowedInternalPlugins = aclExpressionEvaluator(configuration.internalPlugins || [], userGroups, userPermissions)
    const configurationForUser = buildNewConfiguration(configuration, allowedPlugins, allowedInternalPlugins)
    reply.send(configurationForUser)
  }
}

// Removed response schema due to https://github.com/fastify/fast-json-stringify/issues/181
export const configurationApiSchema = {
  summary: 'Expose the configurations of micro-lc',
  response: {
    200: {
      description: 'Configuration of micro-lc',
      type: 'object',
      properties: {},
      additionalProperties: true,
    },
  },
} as const
