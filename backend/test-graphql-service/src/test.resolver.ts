import { Resolver, Query } from '@nestjs/graphql';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class HelloResponse {
  @Field()
  message: string;
}

@Resolver(() => HelloResponse)
export class TestResolver {
  @Query(() => HelloResponse, { name: 'hello' })
  getHello(): HelloResponse {
    return { message: 'Hello from GraphQL Service' };
  }
}
