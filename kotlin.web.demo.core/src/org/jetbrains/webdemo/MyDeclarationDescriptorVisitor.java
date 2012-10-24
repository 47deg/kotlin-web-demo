/*
 * Copyright 2000-2012 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jetbrains.webdemo;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.jetbrains.jet.lang.descriptors.*;
import org.jetbrains.jet.lang.resolve.scopes.receivers.ReceiverDescriptor;
import org.jetbrains.jet.lang.types.JetType;
import org.jetbrains.jet.lang.types.lang.KotlinBuiltIns;

import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: Natalia.Ukhorskaya
 * Date: 10/27/11
 * Time: 11:06 AM
 */

public class MyDeclarationDescriptorVisitor extends DeclarationDescriptorVisitorEmptyBodies<Void, StringBuilder> {
    @Override
    public Void visitValueParameterDescriptor(ValueParameterDescriptor descriptor, StringBuilder builder) {
        /*builder.append("value-parameter").append(" ");
        if (descriptor.isVararg()) {
            builder.append("vararg").append(" ");
        }*/
        return super.visitValueParameterDescriptor(descriptor, builder);
    }

    @Override
    public Void visitVariableDescriptor(VariableDescriptor descriptor, StringBuilder builder) {
        String typeString = renderPropertyPrefixAndComputeTypeString(builder, Collections.<TypeParameterDescriptor>emptyList(), ReceiverDescriptor.NO_RECEIVER, descriptor.getType());
        renderName(descriptor, builder);
        builder.append(" : ").append(typeString);
        return super.visitVariableDescriptor(descriptor, builder);
    }

    private String lt() {
        return escape("<");
    }

    protected String escape(String s) {
        return s;
    }

    protected String renderKeyword(String keyword) {
        return keyword;
    }

    public String renderType(JetType type) {
        if (type == null) {
            return escape("[NULL]");
        } else {
            return escape(type.toString());
        }
    }

    private String renderPropertyPrefixAndComputeTypeString(
            @NotNull StringBuilder builder,
            @NotNull List<TypeParameterDescriptor> typeParameters,
            @NotNull ReceiverDescriptor receiver,
            @Nullable JetType outType) {
        String typeString = lt() + "no type>";
        if (outType != null) {
           // builder.append(renderKeyword("var")).append(" ");
            typeString = renderType(outType);
        }
        else if (outType != null) {
           // builder.append(renderKeyword("val")).append(" ");
            typeString = renderType(outType);
        }

        renderTypeParameters(typeParameters, builder);

        if (receiver.exists()) {
            builder.append(escape(renderType(receiver.getType()))).append(".");
        }

        return typeString;
    }

    @Override
    public Void visitPropertyDescriptor(PropertyDescriptor descriptor, StringBuilder builder) {
        renderModality(descriptor.getModality(), builder);
        /*String typeString = renderPropertyPrefixAndComputeTypeString(
                builder, descriptor.getTypeParameters(),
                descriptor.getReceiverParameter(),
                descriptor.getOutType(),
                descriptor.getInType());*/
        renderName(descriptor, builder);
        //builder.append(" : ").append(typeString);
        return null;
    }

    private void renderModality(Modality modality, StringBuilder builder) {
        /*switch (modality) {
            case FINAL:
                builder.append("final");
                break;
            case OPEN:
                builder.append("open");
                break;
            case ABSTRACT:
                builder.append("abstract");
                break;
        }
        builder.append(" ");*/
    }

    @Override
    public Void visitFunctionDescriptor(FunctionDescriptor descriptor, StringBuilder builder) {
        renderModality(descriptor.getModality(), builder);
        //builder.append("fun").append(" ");
        renderTypeParameters(descriptor.getTypeParameters(), builder);

        ReceiverDescriptor receiver = descriptor.getReceiverParameter();
        if (receiver.exists()) {
            //builder.append(receiver.getType()).append(".");
        }


        renderName(descriptor, builder);
        renderValueParameters(descriptor, builder);
        //builder.append(" : ").append(descriptor.getReturnType());
        return super.visitFunctionDescriptor(descriptor, builder);
    }

    private void renderValueParameters(FunctionDescriptor descriptor, StringBuilder builder) {
        builder.append("(");
        for (Iterator<ValueParameterDescriptor> iterator = descriptor.getValueParameters().iterator(); iterator.hasNext(); ) {
            ValueParameterDescriptor parameterDescriptor = iterator.next();
            parameterDescriptor.accept(this, builder);
            if (iterator.hasNext()) {
                builder.append(", ");
            }
        }
        builder.append(")");
    }

    @Override
    public Void visitConstructorDescriptor(ConstructorDescriptor constructorDescriptor, StringBuilder builder) {
        builder.append("ctor").append(" ");

        ClassDescriptor classDescriptor = constructorDescriptor.getContainingDeclaration();
        builder.append(classDescriptor.getName());

        renderTypeParameters(classDescriptor.getTypeConstructor().getParameters(), builder);
        renderValueParameters(constructorDescriptor, builder);
        return null;
    }

    private void renderTypeParameters(List<TypeParameterDescriptor> typeParameters, StringBuilder builder) {
        /*if (!typeParameters.isEmpty()) {
            builder.append("<");
            for (Iterator<TypeParameterDescriptor> iterator = typeParameters.iterator(); iterator.hasNext(); ) {
                TypeParameterDescriptor typeParameterDescriptor = iterator.next();
                typeParameterDescriptor.accept(this, builder);
                if (iterator.hasNext()) {
                    builder.append(", ");
                }
            }
            builder.append("> ");
        }*/
    }

    @Override
    public Void visitTypeParameterDescriptor(TypeParameterDescriptor descriptor, StringBuilder builder) {
        builder.append("<");
        renderTypeParameter(descriptor, builder);
        builder.append(">");
        return super.visitTypeParameterDescriptor(descriptor, builder);
    }

    @Override
    public Void visitNamespaceDescriptor(NamespaceDescriptor namespaceDescriptor, StringBuilder builder) {
        renderName(namespaceDescriptor, builder);
        return super.visitNamespaceDescriptor(namespaceDescriptor, builder);
    }

    @Override
    public Void visitClassDescriptor(ClassDescriptor descriptor, StringBuilder builder) {
        String keyword = descriptor.getKind() == ClassKind.TRAIT ? "trait" : "class";
        renderClassDescriptor(descriptor, builder, keyword);
        return super.visitClassDescriptor(descriptor, builder);
    }

    public void renderClassDescriptor(ClassDescriptor descriptor, StringBuilder builder, String keyword) {
        renderModality(descriptor.getModality(), builder);
//        builder.append(keyword).append(" ");
        renderName(descriptor, builder);
        renderTypeParameters(descriptor.getTypeConstructor().getParameters(), builder);
        if (!descriptor.equals(KotlinBuiltIns.getInstance().getNothing())) {
            Collection<? extends JetType> supertypes = descriptor.getTypeConstructor().getSupertypes();
            if (!supertypes.isEmpty()) {
                builder.append(" : ");
                for (Iterator<? extends JetType> iterator = supertypes.iterator(); iterator.hasNext(); ) {
                    JetType supertype = iterator.next();
                    builder.append(supertype);
                    if (iterator.hasNext()) {
                        builder.append(", ");
                    }
                }
            }
        }
    }

    protected void renderName(DeclarationDescriptor descriptor, StringBuilder stringBuilder) {
        stringBuilder.append(descriptor.getName());
    }

    protected void renderTypeParameter(TypeParameterDescriptor descriptor, StringBuilder builder) {
        renderName(descriptor, builder);
        if (!descriptor.getUpperBounds().isEmpty()) {
            JetType bound = descriptor.getUpperBounds().iterator().next();
            if (bound != KotlinBuiltIns.getInstance().getDefaultBound()) {
                builder.append(" : ").append(bound);
                if (descriptor.getUpperBounds().size() > 1) {
                    builder.append(" (...)");
                }
            }
        }
    }

    /*private final DeclarationDescriptorVisitor<Void, StringBuilder> subVisitor = new MyDeclarationDescriptorVisitor() {
        @Override
        public Void visitTypeParameterDescriptor(TypeParameterDescriptor descriptor, StringBuilder builder) {
            renderTypeParameter(descriptor, builder);
            return null;
        }

        @Override
        public Void visitValueParameterDescriptor(ValueParameterDescriptor descriptor, StringBuilder builder) {
            return super.visitVariableDescriptor(descriptor, builder);
        }
    };*/

}


