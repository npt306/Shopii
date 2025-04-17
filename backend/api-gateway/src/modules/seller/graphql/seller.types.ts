import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Seller {
    @Field(() => Int)
    id: number;

    @Field()
    shopName: string;

    @Field(() => Int)
    taxCode: number;

    @Field()
    sellerType: string;

    @Field(() => [String])
    email: string[];

    @Field(() => Int)
    followers: number;
}